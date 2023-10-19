/**
 * @typedef {import('estree-jsx').Program} Program
 * @typedef {typeof import('source-map').SourceMapGenerator} SourceMapGenerator
 * @typedef {import('unified').Processor<undefined, undefined, undefined, Program, string>} Processor
 * @typedef {import('vfile').VFile} VFile
 */

/**
 * @typedef Options
 *   Configuration for internal plugin `recma-stringify`.
 * @property {SourceMapGenerator | null | undefined} [SourceMapGenerator]
 *   Generate a source map by passing a `SourceMapGenerator` from `source-map`
 *   in (optional).
 */

import {jsx, toJs} from 'estree-util-to-js'

/**
 * Serialize an esast (estree) program to JavaScript.
 *
 * @type {import('unified').Plugin<[Options | null | undefined] | [], Program, string>}
 *   Plugin.
 */
export function recmaStringify(options) {
  // @ts-expect-error: TS is wrong about `this`.
  // eslint-disable-next-line unicorn/no-this-assignment
  const self = /** @type {Processor} */ (this)
  /* c8 ignore next -- always given in `@mdx-js/mdx` */
  const {SourceMapGenerator} = options || {}

  self.compiler = compiler

  /**
   * @param {Program} tree
   *   Tree.
   * @param {VFile} file
   *   File.
   * @returns {string}
   *   JavaScript.
   */
  function compiler(tree, file) {
    const result = SourceMapGenerator
      ? toJs(tree, {
          SourceMapGenerator,
          filePath: file.path || 'unknown.mdx',
          handlers: jsx
        })
      : toJs(tree, {handlers: jsx})

    file.map = result.map

    return result.value
  }
}
