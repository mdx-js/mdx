const visit = require('unist-util-visit')

module.exports = options => tree => {
  visit(tree, 'html', node => {
    if (
      node.value.startsWith('<!--') &&
      node.value.endsWith('-->')
    ) {
      node.type = 'comment'
    } else {
      node.type = node.mdxType || 'jsx'
    }
  })

  return tree
}
