/**
 * @typedef {import('mdast').Content} Content
 * @typedef {import('mdast').Root} Root
 *
 * @typedef {import('remark-mdx')} DoNotTouchAsThisImportItIncludesMdxInTree
 */

import {visit} from 'unist-util-visit'

/**
 * A tiny plugin that unravels `<p><h1>x</h1></p>` but also
 * `<p><Component /></p>` (so it has no knowledge of “HTML”).
 *
 * It also marks JSX as being explicitly JSX, so when a user passes a `h1`
 * component, it is used for `# heading` but not for `<h1>heading</h1>`.
 *
 * @type {import('unified').Plugin<[], Root>}
 */
export function remarkMarkAndUnravel() {
  return (tree) => {
    visit(tree, (node, index, parent) => {
      let offset = -1
      let all = true
      let oneOrMore = false

      if (parent && typeof index === 'number' && node.type === 'paragraph') {
        const children = node.children

        while (++offset < children.length) {
          const child = children[offset]

          if (
            child.type === 'mdxJsxTextElement' ||
            child.type === 'mdxTextExpression'
          ) {
            oneOrMore = true
          } else if (
            child.type === 'text' &&
            /^[\t\r\n ]+$/.test(String(child.value))
          ) {
            // Empty.
          } else {
            all = false
            break
          }
        }

        if (all && oneOrMore) {
          offset = -1

          /** @type {Array<Content>} */
          const newChildren = []

          while (++offset < children.length) {
            const child = children[offset]

            if (child.type === 'mdxJsxTextElement') {
              // @ts-expect-error: content model is fine.
              child.type = 'mdxJsxFlowElement'
            }

            if (child.type === 'mdxTextExpression') {
              // @ts-expect-error: content model is fine.
              child.type = 'mdxFlowExpression'
            }

            if (
              child.type === 'text' &&
              /^[\t\r\n ]+$/.test(String(child.value))
            ) {
              // Empty.
            } else {
              newChildren.push(child)
            }
          }

          parent.children.splice(index, 1, ...newChildren)
          return index
        }
      }

      if (
        node.type === 'mdxJsxFlowElement' ||
        node.type === 'mdxJsxTextElement'
      ) {
        const data = node.data || (node.data = {})
        data._mdxExplicitJsx = true
      }
    })
  }
}
