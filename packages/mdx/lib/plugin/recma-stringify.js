/**
 * @typedef {import('estree-jsx').Program} Program
 * @typedef {import('unified').Processor<undefined, undefined, undefined, Program, string>} Processor
 * @typedef {import('vfile').VFile} VFile
 *
 * @typedef {import('../core.js').ProcessorOptions} ProcessorOptions
 */

import {jsx, toJs} from 'estree-util-to-js'

/**
 * Serialize an esast (estree) program to JavaScript.
 *
 * @type {import('unified').Plugin<[Readonly<ProcessorOptions>], Program, string>}
 */
export function recmaStringify(options) {
  // @ts-expect-error: TS is wrong about `this`.
  // eslint-disable-next-line unicorn/no-this-assignment
  const self = /** @type {Processor} */ (this)
  const {SourceMapGenerator} = options

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
