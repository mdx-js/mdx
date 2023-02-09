/**
 * @typedef {import('estree-jsx').Node} Node
 * @typedef {import('estree-jsx').Declaration} Declaration
 */

/**
 * Check if `node` is a declaration.
 *
 * @param {Node} node
 *   Node to check.
 * @returns {node is Declaration}
 *   Whether `node` is a declaration.
 */
export function isDeclaration(node) {
  return Boolean(
    node.type === 'FunctionDeclaration' ||
      node.type === 'ClassDeclaration' ||
      node.type === 'VariableDeclaration'
  )
}
