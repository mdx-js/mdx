/**
 * @typedef {import('estree-jsx').Program} Program
 * @typedef {import('estree-util-build-jsx').Options} BuildJsxOptions
 * @typedef {import('vfile').VFile} VFile
 */

/**
 * @typedef ExtraOptions
 *   Configuration for internal plugin `recma-jsx-build`.
 * @property {'function-body' | 'program' | null | undefined} [outputFormat='program']
 *   Whether to keep the import of the automatic runtime or get it from
 *   `arguments[0]` instead (default: `'program'`).
 *
 * @typedef {BuildJsxOptions & ExtraOptions} Options
 *   Options.
 */

import {buildJsx} from 'estree-util-build-jsx'
import {specifiersToDeclarations} from '../util/estree-util-specifiers-to-declarations.js'
import {toIdOrMemberExpression} from '../util/estree-util-to-id-or-member-expression.js'

/**
 * A plugin to build JSX into function calls.
 * `estree-util-build-jsx` does all the work for us!
 *
 * @param {Readonly<Options> | null | undefined} [options]
 *   Configuration (optional).
 * @returns
 *   Transform.
 */
export function recmaJsxBuild(options) {
  /* c8 ignore next -- always given in `@mdx-js/mdx` */
  const {development, outputFormat} = options || {}

  /**
   * @param {Program} tree
   *   Tree.
   * @param {VFile} file
   *   File.
   * @returns {undefined}
   *   Nothing.
   */
  return function (tree, file) {
    buildJsx(tree, {development, filePath: file.history[0]})

    // Remove the pragma comment that we injected ourselves as it is no longer
    // needed.
    if (tree.comments) {
      tree.comments = tree.comments.filter(function (d) {
        return !d.data?._mdxIsPragmaComment
      })
    }

    // When compiling to a function body, replace the import that was just
    // generated, and get `jsx`, `jsxs`, and `Fragment` from `arguments[0]`
    // instead.
    if (outputFormat === 'function-body') {
      let index = 0

      // Skip directives: JS currently only has `use strict`, but Acorn allows
      // arbitrary ones.
      // Practically things like `use client` could be used?
      while (index < tree.body.length) {
        const child = tree.body[index]
        if ('directive' in child && child.directive) {
          index++
        } else {
          break
        }
      }

      const declaration = tree.body[index]

      if (
        declaration &&
        declaration.type === 'ImportDeclaration' &&
        typeof declaration.source.value === 'string' &&
        /\/jsx-(dev-)?runtime$/.test(declaration.source.value)
      ) {
        tree.body[index] = {
          type: 'VariableDeclaration',
          kind: 'const',
          declarations: specifiersToDeclarations(
            declaration.specifiers,
            toIdOrMemberExpression(['arguments', 0])
          )
        }
      }
    }
  }
}
