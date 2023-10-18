/**
 * @typedef {import('rehype-sanitize').Options} Options
 */

/**
 * @type {Readonly<Options>}
 */
export const schema = {
  ancestors: {},
  attributes: {
    a: ['href'],
    '*': []
  },
  protocols: {href: ['http', 'https']},
  strip: ['script', 'style'],
  tagNames: [
    'a',
    'b',
    'code',
    'del',
    'em',
    'i',
    'li',
    'ol',
    'p',
    'pre',
    's',
    'strike',
    'strong',
    'ul'
  ]
}
