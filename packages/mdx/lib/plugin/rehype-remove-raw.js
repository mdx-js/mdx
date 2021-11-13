/**
 * @typedef {import('hast').Root} Root
 */

import {visit} from 'unist-util-visit'

/**
 * A tiny plugin that removes raw HTML.
 * This is needed if the format is `md` and `rehype-raw` was not used to parse
 * dangerous HTML into nodes.
 *
 * @type {import('unified').Plugin<Array<void>, Root>}
 */
export function rehypeRemoveRaw() {
  return (tree) => {
    visit(tree, 'raw', (_, index, parent) => {
      if (parent && typeof index === 'number') {
        parent.children.splice(index, 1)
        return index
      }
    })
  }
}
