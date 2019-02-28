// Source copied and then modified from
// https://github.com/remarkjs/remark/blob/master/packages/remark-parse/lib/util/html.js
//
// MIT License https://github.com/remarkjs/remark/blob/master/license

const attributeName = '[a-zA-Z_:][a-zA-Z0-9:._-]*'
const unquoted = '[^"\'=<>`\\u0000-\\u0020]+'
const singleQuoted = "'[^']*'"
const doubleQuoted = '"[^"]*"'
const jsProps = '{.*}'
const attributeValue =
  '(?:' +
  unquoted +
  '|' +
  singleQuoted +
  '|' +
  doubleQuoted +
  '|' +
  jsProps +
  ')'
const attribute =
  '(?:\\s+' + attributeName + '(?:\\s*=\\s*' + attributeValue + ')?)'
const openTag = '<[A-Za-z]*[A-Za-z0-9\\.\\-]*' + attribute + '*\\s*\\/?>'
const closeTag = '<\\/[A-Za-z][A-Za-z0-9\\.\\-]*\\s*>'
const comment = '<!---->|<!--(?:-?[^>-])(?:-?[^-])*-->'
const processing = '<[?].*?[?]>'
const declaration = '<![A-Za-z]+\\s+[^>]*>'
const cdata = '<!\\[CDATA\\[[\\s\\S]*?\\]\\]>'

exports.openCloseTag = new RegExp('^(?:' + openTag + '|' + closeTag + ')')

exports.tag = new RegExp(
  '^(?:' +
    openTag +
    '|' +
    closeTag +
    '|' +
    comment +
    '|' +
    processing +
    '|' +
    declaration +
    '|' +
    cdata +
    ')',
  's'
)
