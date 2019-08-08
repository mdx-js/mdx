const visit = require('unist-util-visit')

const commentOpen = '<!--'
const commentClose = '-->'
const isComment = str =>
  str.startsWith(commentOpen) && str.endsWith(commentClose)
const getCommentContents = str =>
  str.slice(commentOpen.length, -commentClose.length)

module.exports = _options => tree => {
  visit(tree, 'jsx', node => {
    if (isComment(node.value)) {
      node.type = 'comment'
      node.value = getCommentContents(node.value)
    }
  })

  return tree
}
