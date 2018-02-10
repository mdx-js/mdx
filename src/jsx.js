import visit from 'unist-util-visit'

export default options => (tree, file) =>
  visit(tree, 'text', (node, i, parent) => {
    console.log(node)

    if (!/^\s*</.test(node.value)) {
      return
    }
  })
