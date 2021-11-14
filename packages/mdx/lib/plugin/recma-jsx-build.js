/**
 * @typedef {import('estree-jsx').Program} Program
 *
 * @typedef RecmaJsxBuildOptions
 * @property {'program'|'function-body'} [outputFormat='program']
 *   Whether to keep the import of the automatic runtime or get it from
 *   `arguments[0]` instead.
 */

import {buildJsx} from 'estree-util-build-jsx'
import {specifiersToDeclarations} from '../util/estree-util-specifiers-to-declarations.js'
import {toIdOrMemberExpression} from '../util/estree-util-to-id-or-member-expression.js'

/**
 * A plugin to build JSX into function calls.
 * `estree-util-build-jsx` does all the work for us!
 *
 * @type {import('unified').Plugin<[RecmaJsxBuildOptions]|[], Program>}
 */
export function recmaJsxBuild(options = {}) {
  const {outputFormat} = options

  return (tree) => {
    buildJsx(tree)

    // When compiling to a function body, replace the import that was just
    // generated, and get `jsx`, `jsxs`, and `Fragment` from `arguments[0]`
    // instead.
    if (
      outputFormat === 'function-body' &&
      tree.body[0] &&
      tree.body[0].type === 'ImportDeclaration' &&
      typeof tree.body[0].source.value === 'string' &&
      /\/jsx-runtime$/.test(tree.body[0].source.value)
    ) {
      tree.body[0] = {
        type: 'VariableDeclaration',
        kind: 'const',
        declarations: specifiersToDeclarations(
          tree.body[0].specifiers,
          toIdOrMemberExpression(['arguments', 0])
        )
      }
    }
  }
}
