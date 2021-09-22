/**
 * @typedef {import('estree-jsx').Declaration} Declaration
 * @typedef {import('estree-jsx').Expression} Expression
 */

/**
 * Turn a declaration into an expression.
 * Doesn’t work for variable declarations, but that’s fine for our use case
 * because currently we’re using this utility for export default declarations,
 * which can’t contain variable declarations.
 *
 * @param {Declaration} declaration
 * @returns {Expression}
 */
export function declarationToExpression(declaration) {
  if (declaration.type === 'FunctionDeclaration') {
    return {...declaration, type: 'FunctionExpression'}
  }

  if (declaration.type === 'ClassDeclaration') {
    return {...declaration, type: 'ClassExpression'}
    /* c8 ignore next 4 */
  }

  // Probably `VariableDeclaration`.
  throw new Error('Cannot turn `' + declaration.type + '` into an expression')
}
