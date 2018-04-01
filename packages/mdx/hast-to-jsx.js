function toJSX(node) {
  let children = ''

  if (node.type === 'root') {
    const importNodes = []
    const exportNodes = []
    const jsxNodes = []
    for(const childNode of node.children) {
      if(childNode.type === 'import') {
        importNodes.push(childNode)
        continue
      }

      if(childNode.type === 'export') {
        exportNodes.push(childNode)
        continue
      }

      jsxNodes.push(childNode)
    }

    return (
      importNodes.map(toJSX).join('\n') +
      '\n' +
      exportNodes.map(toJSX).join('\n') +
      '\n' +
      `export default ({components}) => <MDXTag name="wrapper">${jsxNodes.map(toJSX).join('')}</MDXTag>`
    )    
  }

  // recursively walk through children
  if (node.children) {
    children = node.children.map(toJSX).join('')
  }

  if (node.type === 'element') {
    // This makes sure codeblocks can hold code and backticks
    if (node.tagName === 'code') {
      children =
        '{`' + children.replace(/`/g, '\\`').replace(/\$/g, '\\$') + '`}'
    }

    return `<MDXTag name="${
      node.tagName
    }" components={components} props={${JSON.stringify(
      node.properties
    )}}>${children}</MDXTag>`
  }

  if (
    node.type === 'text' ||
    node.type === 'import' ||
    node.type === 'export' ||
    node.type === 'jsx'
  ) {
    return node.value
  }
}

module.exports = toJSX
