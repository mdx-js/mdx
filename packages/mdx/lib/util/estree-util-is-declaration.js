/**
 * @typedef {import('estree-jsx').Declaration} Declaration
 * @typedef {import('estree-jsx').MaybeNamedClassDeclaration} MaybeNamedClassDeclaration
 * @typedef {import('estree-jsx').MaybeNamedFunctionDeclaration} MaybeNamedFunctionDeclaration
 * @typedef {import('estree-jsx').Node} Node
 */

// Fix to show references to above types in VS Code.
''

/**
 * Check if `node` is a declaration.
 *
 * @param {Readonly<MaybeNamedClassDeclaration | MaybeNamedFunctionDeclaration | Node>} node
 *   Node to check.
 * @returns {node is Declaration | MaybeNamedClassDeclaration | MaybeNamedFunctionDeclaration}
 *   Whether `node` is a declaration.
 */
export function isDeclaration(node) {
  return Boolean(
    node.type === 'FunctionDeclaration' ||
      node.type === 'ClassDeclaration' ||
      node.type === 'VariableDeclaration'
  )
}
