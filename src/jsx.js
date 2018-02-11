import visit from 'unist-util-visit'

export default options => (tree, file) =>
  visit(tree, 'element', (node, i, parent) => {
    // TODO: walk all opening tags and match with closing
    // and combine into a single `html` node for HAST
    // transformation
  })
