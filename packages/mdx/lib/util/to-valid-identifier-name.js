import {start, cont} from 'estree-util-is-identifier-name'

/**
 * Replace all invalid identifier characters with underscores "_"
 * @param {string} string_
 */
export function toValidIdentifierName(string_) {
  if (string_.length === 0) return '_'
  let validString = ''
  validString += start(string_[0].charCodeAt(0)) ? string_[0] : '_'
  for (const char of string_.slice(1)) {
    validString += cont(char.charCodeAt(0)) ? char : '_'
  }

  return validString
}
