const visit = require('unist-util-visit')
const getImports = require('./get-imports')

const IMPORT_REGEX = /^import/
const ESCAPED_IMPORT_REGEX = /^\\import/
const isImport = text => IMPORT_REGEX.test(text)
const isEscapedImport = text => ESCAPED_IMPORT_REGEX.test(text)

const unescape = node => {
  if (isEscapedImport(node.value)) {
    node.value = node.value.replace(ESCAPED_IMPORT_REGEX, 'import')
  }
}

const imports = tree =>
  visit(tree, 'text', (node, _i, parent) => {
    if (!isImport(node.value)) {
      return unescape(node)
    }

    parent.type = 'import'
    parent.value = node.value
    delete parent.children
  })

const jsx = tree =>
  visit(tree, 'html', node => node.type = 'jsx')

module.exports = options => tree => {
  imports(tree)
  jsx(tree)

  return tree
}

module.exports.getImports = getImports
