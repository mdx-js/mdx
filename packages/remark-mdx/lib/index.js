/**
 * @typedef {import('mdast-util-mdx').ToMarkdownOptions} ToMarkdownOptions
 * @typedef {import('micromark-extension-mdxjs').Options} MicromarkOptions
 * @typedef {import('unified').Processor} Processor
 */

/**
 * @typedef {MicromarkOptions & ToMarkdownOptions} Options
 *   Configuration.
 */

import {mdxFromMarkdown, mdxToMarkdown} from 'mdast-util-mdx'
import {mdxjs} from 'micromark-extension-mdxjs'

/** @type {Readonly<Options>} */
const emptyOptions = {}

/**
 * Add support for MDX (JSX: `<Video id={123} />`, export/imports: `export {x}
 * from 'y'`; and expressions: `{1 + 1}`).
 *
 * @param {Readonly<Options> | null | undefined} [options]
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
