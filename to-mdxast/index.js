const visit = require('unist-util-visit')

const IMPORT_REGEX = /^import/
const ESCAPED_IMPORT_REGEX = /^\\import/
const isImport = text => IMPORT_REGEX.test(text)
const isEscapedImport = text => ESCAPED_IMPORT_REGEX.test(text)

const unescape = node => {
  if (isEscapedImport(node.value)) {
    node.value = node.value.replace(ESCAPED_IMPORT_REGEX, 'import')
  }
}

const imports = tree => {
  return visit(tree, 'paragraph', (node, _i, parent) => {
    // `import` must be defined at the top level to be a real import
    if(parent.type !== 'root') {
      return node
    }

    // Paragraphs only have text in 1 node
    if(node.children.length !== 1) {
      return node
    }

    // Get the text from the text node
    const {value} = node.children[0]

    // Check if the value starts with `import`
    if(!isImport(value)) {
      return node
    }

    // Sets type to `import` in the AST
    node.type = 'import'
    node.value = value
    delete node.children

    return node
  })
}
  

// turns `html` nodes into `jsx` nodes
const jsx = tree => visit(tree, 'html', node => node.type = 'jsx')

module.exports = options => tree => {
  imports(tree)
  jsx(tree)

  return tree
}
