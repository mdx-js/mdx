import markdownExtensions from 'markdown-extensions'

export const mdx = ['.mdx']
/** @type {Array<string>} */
export const md = markdownExtensions.map((d) => '.' + d)
