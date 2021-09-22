/**
 * @typedef {import('estree-jsx').Declaration} Declaration
 */

/**
 * @param {unknown} node
 * @returns {node is Declaration}
 */
export function isDeclaration(node) {
  /** @type {string} */
  // @ts-expect-error Hush typescript, looks like `type` is available.
  const type = node && typeof node === 'object' && node.type
  return Boolean(
    type === 'FunctionDeclaration' ||
      type === 'ClassDeclaration' ||
      type === 'VariableDeclaration'
  )
}
