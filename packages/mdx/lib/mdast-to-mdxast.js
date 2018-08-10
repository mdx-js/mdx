const visit = require('unist-util-visit')

module.exports = options => tree => {
  visit(tree, 'html', node => {
    node.type = node.mdxType || 'jsx'
  })

  return tree
}
