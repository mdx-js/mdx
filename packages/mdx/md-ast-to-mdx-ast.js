const visit = require('unist-util-visit')

var commentOpen = '<!--'
var commentClose = '-->'

module.exports = options => tree => {
  visit(tree, 'html', node => {
    if (
      node.value.startsWith(commentOpen) &&
      node.value.endsWith(commentClose)
    ) {
      node.type = 'comment'
      node.value = node.value.slice(commentOpen.length, -commentClose.length)
    } else {
      node.type = node.mdxType || 'jsx'
    }
  })

  return tree
}
