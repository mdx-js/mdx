/**
 * @typedef {import('estree-jsx').Identifier} Identifier
 * @typedef {import('estree-jsx').Literal} Literal
 * @typedef {import('estree-jsx').JSXIdentifier} JSXIdentifier
 * @typedef {import('estree-jsx').MemberExpression} MemberExpression
 * @typedef {import('estree-jsx').JSXMemberExpression} JSXMemberExpression
 */

import {name as isIdentifierName} from 'estree-util-is-identifier-name'

export const toIdOrMemberExpression = toIdOrMemberExpressionFactory(
  'Identifier',
  'MemberExpression'
)

export const toJsxIdOrMemberExpression =
  // @ts-expect-error: fine
  /** @type {(ids: Array<string|number>) => JSXIdentifier|JSXMemberExpression)} */
  (toIdOrMemberExpressionFactory('JSXIdentifier', 'JSXMemberExpression'))

/**
 * @param {string} [idType]
 * @param {string} [memberType]
 */
function toIdOrMemberExpressionFactory(idType, memberType) {
  return toIdOrMemberExpression
  /**
   * @param {Array<string|number>} ids
   * @returns {Identifier|MemberExpression}
   */
  function toIdOrMemberExpression(ids) {
    let index = -1
    /** @type {Identifier|Literal|MemberExpression|undefined} */
    let object

    while (++index < ids.length) {
      const name = ids[index]
      /** @type {Identifier|Literal} */
      // @ts-expect-error: JSX is fine.
      const id =
        typeof name === 'string' && isIdentifierName(name)
          ? {type: idType, name}
          : {type: 'Literal', value: name}
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
