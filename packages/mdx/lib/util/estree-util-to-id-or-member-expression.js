/**
 * @typedef {import('estree-jsx').Identifier} Identifier
 * @typedef {import('estree-jsx').JSXIdentifier} JSXIdentifier
 * @typedef {import('estree-jsx').JSXMemberExpression} JSXMemberExpression
 * @typedef {import('estree-jsx').Literal} Literal
 * @typedef {import('estree-jsx').MemberExpression} MemberExpression
 */

import {
  start as esStart,
  cont as esCont,
  name as isIdentifierName
} from 'estree-util-is-identifier-name'

export const toIdOrMemberExpression = toIdOrMemberExpressionFactory(
  'Identifier',
  'MemberExpression',
  isIdentifierName
)

export const toJsxIdOrMemberExpression =
  // @ts-expect-error: fine
  /** @type {(ids: Array<string | number>) => JSXIdentifier | JSXMemberExpression)} */
  (
    toIdOrMemberExpressionFactory(
      'JSXIdentifier',
      'JSXMemberExpression',
      isJsxIdentifierName
    )
  )

/**
 * @param {string} idType
 * @param {string} memberType
 * @param {(value: string) => boolean} isIdentifier
 */
function toIdOrMemberExpressionFactory(idType, memberType, isIdentifier) {
  return toIdOrMemberExpression
  /**
   * @param {Array<string | number>} ids
   * @returns {Identifier | MemberExpression}
   */
  function toIdOrMemberExpression(ids) {
    let index = -1
    /** @type {Identifier | Literal | MemberExpression | undefined} */
    let object

    while (++index < ids.length) {
      const name = ids[index]
      const valid = typeof name === 'string' && isIdentifier(name)

      // A value of `asd.123` could be turned into `asd['123']` in the JS form,
      // but JSX does not have a form for it, so throw.
      /* c8 ignore next 3 */
      if (idType === 'JSXIdentifier' && !valid) {
        throw new Error('Cannot turn `' + name + '` into a JSX identifier')
      }

      /** @type {Identifier | Literal} */
      // @ts-expect-error: JSX is fine.
      const id = valid ? {type: idType, name} : {type: 'Literal', value: name}
      // @ts-expect-error: JSX is fine.
      object = object
        ? {
            type: memberType,
            object,
            property: id,
            computed: id.type === 'Literal',
            optional: false
          }
        : id
    }

    // Just for types.
    /* c8 ignore next 3 */
    if (!object) throw new Error('Expected non-empty `ids` to be passed')
    if (object.type === 'Literal')
      throw new Error('Expected identifier as left-most value')

    return object
  }
}

/**
 * Checks if the given string is a valid JSX identifier name.
 * @param {string} name
 */
function isJsxIdentifierName(name) {
  let index = -1

  while (++index < name.length) {
    // We currently receive valid input, but this catches bugs and is needed
    // when externalized.
    /* c8 ignore next */
    if (!(index ? jsxCont : esStart)(name.charCodeAt(index))) return false
  }

  // `false` if `name` is empty.
  return index > 0
}

/**
 * Checks if the given character code can continue a JSX identifier.
 * @param {number} code
 */
function jsxCont(code) {
  return code === 45 /* `-` */ || esCont(code)
}
