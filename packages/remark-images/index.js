const isUrl = require('is-url')
const visit = require('unist-util-visit')

const isImgExt = str => /\.(svg|png|jpg|jpeg|gif)$/.test(str)
const isAbsolutePath = str => str.startsWith('/')
const isRelativePath = str => str.startsWith('./') || str.startsWith('../')
const isImgPath = str => isAbsolutePath(str) || isRelativePath(str)

module.exports = () => tree =>
  visit(tree, 'text', node => {
    const text = node.value ? node.value.trim() : ''

    if ((isUrl(text) || isImgPath(text)) && isImgExt(text)) {
      node.type = 'image'
      node.url = text

      delete node.value
    }
  })
