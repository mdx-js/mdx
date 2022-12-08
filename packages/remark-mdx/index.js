/**
 * @typedef {import('mdast').Root} Root
 * @typedef {import('micromark-extension-mdxjs').Options} MicromarkOptions
 * @typedef {import('mdast-util-mdx').ToMarkdownOptions} ToMarkdownOptions
 * @typedef {MicromarkOptions & ToMarkdownOptions} Options
 *
 * @typedef {import('mdast-util-mdx')} DoNotTouchAsThisImportItIncludesMdxInTree
 */

import {mdxjs} from 'micromark-extension-mdxjs'
import {mdxFromMarkdown, mdxToMarkdown} from 'mdast-util-mdx'

/**
 * Plugin to support MDX (import/exports: `export {x} from 'y'`; expressions:
 * `{1 + 1}`; and JSX: `<Video id={123} />`).
 *
 * @this {import('unified').Processor}
 * @type {import('unified').Plugin<[Options?]|Array<void>, Root>}
 */
export default function remarkMdx(options = {}) {
  const data = this.data()

  add('micromarkExtensions', mdxjs(options))
  add('fromMarkdownExtensions', mdxFromMarkdown())
  add('toMarkdownExtensions', mdxToMarkdown(options))

  /**
   * @param {string} field
   * @param {unknown} value
   */
  function add(field, value) {
    const list = /** @type {Array<unknown>} */ (
      // Other extensions
      /* c8 ignore next 2 */
      data[field] ? data[field] : (data[field] = [])
    )

    list.push(value)
  }
}
