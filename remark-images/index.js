const isUrl = require('is-url')
const visit = require('unist-util-visit')

module.exports = () => (tree, file) =>
  visit(tree, 'text', node => {
    const text = node.value ? node.value.trim() : ''

    if (!isUrl(text)) {
      return
    }

    node.type = 'image'
    node.url = text

    delete node.value
  })
