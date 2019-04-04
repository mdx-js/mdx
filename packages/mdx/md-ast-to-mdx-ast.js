const visit = require('unist-util-visit')

const commentOpen = '<!--'
const commentClose = '-->'

module.exports = _options => tree => {
  visit(tree, 'jsx', node => {
    if (
      node.value.startsWith(commentOpen) &&
      node.value.endsWith(commentClose)
    ) {
      node.type = 'comment'
      node.value = node.value.slice(commentOpen.length, -commentClose.length)
    }
  })

  return tree
}
