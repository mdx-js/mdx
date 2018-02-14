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

module.exports = options => (tree, file) =>
  visit(tree, 'text', (node, i, parent) => {
    if (!isImport(node.value)) {
      return unescape(node)
    }

    const siblings = parent.children
    parent.children = siblings
      .splice(0, i)
      .concat(
        siblings.slice(i + 1, siblings.length)
      )
  })
