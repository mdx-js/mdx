// @ts-expect-error: untyped.
import markdownExtensions from 'markdown-extensions'

export const mdx = ['.mdx']
/** @type {Array<string>} */
export const md = markdownExtensions.map((/** @type {string} */ d) => '.' + d)
