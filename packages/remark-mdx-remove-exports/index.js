const remove = require('unist-util-remove')

module.exports = _options => tree => {
  return remove(tree, 'export')
}
