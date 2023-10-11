/**
 * @typedef {import('unified').Processor} Processor
 * @typedef {import('micromark-extension-mdxjs').Options} MicromarkOptions
 * @typedef {import('mdast-util-mdx').ToMarkdownOptions} ToMarkdownOptions
 * @typedef {import('mdast-util-mdx')} DoNotTouchAsThisIncludesMdxInTree
 */

/**
 * @typedef {MicromarkOptions & ToMarkdownOptions} Options
 *   Configuration.
 */

import {mdxjs} from 'micromark-extension-mdxjs'
import {mdxFromMarkdown, mdxToMarkdown} from 'mdast-util-mdx'

/** @type {Options} */
const emptyOptions = {}

/**
 * Plugin to support MDX (import/exports: `export {x} from 'y'`; expressions:
 * `{1 + 1}`; and JSX: `<Video id={123} />`).
 *
 * @param {Options | null | undefined} [options]
 *   Configuration (optional).
 * @returns {undefined}
 *   Nothing.
 */
export default function remarkMdx(options) {
  // @ts-expect-error: TS is wrong about `this`.
  // eslint-disable-next-line unicorn/no-this-assignment
  const self = /** @type {Processor} */ (this)
  const settings = options || emptyOptions
  const data = self.data()

  const micromarkExtensions =
    data.micromarkExtensions || (data.micromarkExtensions = [])
  const fromMarkdownExtensions =
    data.fromMarkdownExtensions || (data.fromMarkdownExtensions = [])
  const toMarkdownExtensions =
    data.toMarkdownExtensions || (data.toMarkdownExtensions = [])

  micromarkExtensions.push(mdxjs(settings))
  fromMarkdownExtensions.push(mdxFromMarkdown())
  toMarkdownExtensions.push(mdxToMarkdown(settings))
}
