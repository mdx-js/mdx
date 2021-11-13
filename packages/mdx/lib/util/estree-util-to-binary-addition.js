/**
 * @typedef {import('estree-jsx').Expression} Expression
 */

/**
 * @param {Array<Expression>} expressions
 */
export function toBinaryAddition(expressions) {
  let index = -1
  /** @type {Expression|undefined} */
  let left

  while (++index < expressions.length) {
    const right = expressions[index]
    left = left ? {type: 'BinaryExpression', left, operator: '+', right} : right
  }

  // Just for types.
  /* c8 ignore next */
  if (!left) throw new Error('Expected non-empty `expressions` to be passed')

  return left
}
