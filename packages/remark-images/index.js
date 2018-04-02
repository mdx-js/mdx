const isUrl = require('is-url')
const visit = require('unist-util-visit')

const isImgUrl = str => /\.(svg|png|jpg|jpeg)$/.test(str)

module.exports = () => (tree, file) =>
  visit(tree, 'text', node => {
    const text = node.value ? node.value.trim() : ''

    if (!isUrl(text) || !isImgUrl(text)) {
      return
    }

    node.type = 'image'
    node.url = text

    delete node.value
  })
