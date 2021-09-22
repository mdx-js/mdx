/**
 * @typedef {import('mdast').Root} Root
 * @typedef {import('micromark-extension-mdxjs').Options} Options
 *
 * @typedef {import('mdast-util-mdx')} DoNotTouchAsThisImportIncludesMdxInTree
 */

import {mdxjs} from 'micromark-extension-mdxjs'
import {mdxFromMarkdown, mdxToMarkdown} from 'mdast-util-mdx'

/**
 * Add the micromark and mdast extensions for MDX.js (JS aware MDX).
 *
 * @type {import('unified').Plugin<[Options?]|[], Root>}
 */
export function remarkMdx(options = {}) {
  const data = this.data()

  add('micromarkExtensions', mdxjs(options))
  add('fromMarkdownExtensions', mdxFromMarkdown)
  add('toMarkdownExtensions', mdxToMarkdown)

  /**
   * @param {string} field
   * @param {unknown} value
   */
  function add(field, value) {
    const list = /** @type {unknown[]} */ (
      // Other extensions
      /* c8 ignore next 2 */
      data[field] ? data[field] : (data[field] = [])
    )

    list.push(value)
  }
}
