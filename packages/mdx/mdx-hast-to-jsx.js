function toJSX(node, parentNode = {}) {
  let children = ''

  if (node.type === 'root') {
    const importNodes = []
    const exportNodes = []
    const jsxNodes = []
    for (const childNode of node.children) {
      if (childNode.type === 'import') {
        importNodes.push(childNode)
        continue
      }

      if (childNode.type === 'export') {
        exportNodes.push(childNode)
        continue
      }

      jsxNodes.push(childNode)
    }

    return (
      importNodes.map(childNode => toJSX(childNode, node)).join('\n') +
      '\n' +
      exportNodes.map(childNode => toJSX(childNode, node)).join('\n') +
      '\n' +
      `export default ({components}) => <MDXTag name="wrapper">${jsxNodes
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
    if (Object.keys(node.properties).length > 0) {
      props = JSON.stringify(node.properties)
    }

    return `<MDXTag name="${node.tagName}" components={components}${
      parentNode.tagName ? ` parentName="${parentNode.tagName}"` : ''
    }${props ? ` props={${props}}` : ''}>${children}</MDXTag>`
  }

  // Wraps all text nodes inside template string, so that we don't run into escaping issues.
  if(node.type === 'text') {
    return '{`' + node.value.replace(/`/g, '\\`').replace(/\$/g, '\\$') + '`}'
  }

  if (
    node.type === 'import' ||
    node.type === 'export' ||
    node.type === 'jsx'
  ) {
    return node.value
  }
}

function compile() {
  this.Compiler = tree => {
    return toJSX(tree)
  }
}

module.exports = compile
exports = compile
exports.toJSX = toJSX
exports.default = compile
