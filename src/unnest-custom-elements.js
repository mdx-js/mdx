import visit from 'unist-util-visit'
import phrasing from 'hast-util-phrasing'

export default options => tree =>
  visit(tree, 'p', (node, i, parent) => {
    const allPhrasing = node.value.children.every(phrasing)

    if (!allPhrasing && parent.type === 'paragraph') {
      parent.type = 'div'
    }
  })
