/**
 * @import {Program} from 'estree-jsx'
 * @import {Plugin, Processor} from 'unified'
 * @import {VFile} from 'vfile'
 * @import {ProcessorOptions} from '../core.js'
 */

import {jsx, toJs} from 'estree-util-to-js'

/**
 * Serialize an esast (estree) program to JavaScript.
 *
 * @type {Plugin<[Readonly<ProcessorOptions>], Program, string>}
 */
export function recmaStringify(options) {
  // eslint-disable-next-line unicorn/no-this-assignment
  const self =
    // @ts-expect-error: TS is wrong about `this`.
    /** @type {Processor<undefined, undefined, undefined, Program, string>} */ (
      this
    )
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
