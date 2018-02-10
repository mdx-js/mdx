import visit from 'unist-util-visit'

export default options => (tree, file) =>
  visit(tree, 'text', (node, i, parent) => {
    console.log(node)

    if (!/^\s*</.test(node.value)) {
      return
    }

    // TODO: walk all opening tags and match with closing
    // and combine into a single `html` node for HAST
    // transformation
  })
