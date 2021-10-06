export const schema = {
  strip: ['script', 'style'],
  ancestors: {},
  protocols: {href: ['http', 'https']},
  tagNames: [
    'ul',
    'ol',
    'li',
    'pre',
    'code',
    'strong',
    'p',
    'b',
    'em',
    'i',
    'strike',
    's',
    'del',
    'a'
  ],
  attributes: {
    a: ['href'],
    '*': []
  }
}
