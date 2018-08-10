function toJSX(node, parentNode = {}, options = {}) {
  let children = ''

  if (node.type === 'root') {
    const importNodes = []
    const exportNodes = []
    const jsxNodes = []
    let layout
    for (const childNode of node.children) {
      if (childNode.type === 'import') {
        importNodes.push(childNode)
        continue
      }

      if (childNode.type === 'export') {
        if (childNode.default) {
          layout = childNode.value.replace(/^export default /, '')
          continue
        }

        exportNodes.push(childNode)
        continue
      }

      if (childNode.type === 'jsx') {
        childNode.value = childNode.value
          .replace('<!--', '{/*')
          .replace('-->', '*/}')
      }

      jsxNodes.push(childNode)
    }

    return (
      importNodes.map(childNode => toJSX(childNode, node)).join('\n') +
      '\n' +
      exportNodes.map(childNode => toJSX(childNode, node)).join('\n') +
      '\n' +
      (options.skipExport ? '' : 'export default ({components, ...props}) => ') +
      `<MDXTag name="wrapper" ${
        layout ? `Layout={${layout}} layoutProps={props}` : ''
      } components={components}>${jsxNodes
        .map(childNode => toJSX(childNode, node))
        .join('')}</MDXTag>`
    )
  }

  // recursively walk through children
  if (node.children) {
    children = node.children.map(childNode => toJSX(childNode, node)).join('')
  }

  if (node.type === 'element') {
    let props = ''

    if (Array.isArray(node.properties.className)) {
      node.properties.className = node.properties.className.join(' ')
    }

    if (Object.keys(node.properties).length > 0) {
      props = JSON.stringify(node.properties)
    }

    return `<MDXTag name="${node.tagName}" components={components}${
      parentNode.tagName ? ` parentName="${parentNode.tagName}"` : ''
    }${props ? ` props={${props}}` : ''}>${children}</MDXTag>`
  }

  // Wraps all text nodes except new lines inside template string, so that we don't run into escaping issues.
  if (node.type === 'text') {
    return node.value === '\n'
      ? node.value
      : '{`' + node.value.replace(/`/g, '\\`').replace(/\$/g, '\\$') + '`}'
  }

  if (node.type === 'import' || node.type === 'export' || node.type === 'jsx') {
    return node.value
  }
}

function compile(options = {}) {
  this.Compiler = tree => {
    return toJSX(tree, {}, options)
  }
}

module.exports = compile
exports = compile
exports.toJSX = toJSX
exports.default = compile
