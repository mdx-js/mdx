/**
 * @import {Program} from 'estree-jsx'
 * @import {Processor} from 'unified'
 * @import {VFile} from 'vfile'
 * @import {ProcessorOptions} from '../core.js'
 */

import {jsx, toJs} from 'estree-util-to-js'

/**
 * Serialize an esast (estree) program to JavaScript.
 *
 * @this {Processor<undefined, undefined, undefined, Program, string>}
 *   Processor.
 * @param {Readonly<ProcessorOptions>} options
 *   Configuration.
 */
export function recmaStringify(options) {
  const {SourceMapGenerator} = options

  this.compiler = compiler

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
