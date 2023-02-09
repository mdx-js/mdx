/**
 * @typedef {import('estree-jsx').Program} Program
 * @typedef {typeof import('source-map').SourceMapGenerator} SourceMapGenerator
 *
 * @typedef RecmaStringifyOptions
 *   Configuration for internal plugin `recma-stringify`.
 * @property {SourceMapGenerator | null | undefined} [SourceMapGenerator]
 *   Generate a source map by passing a `SourceMapGenerator` from `source-map`
 *   in.
 */

import {toJs, jsx} from 'estree-util-to-js'

/**
 * A plugin that adds an esast compiler: a small wrapper around `astring` to add
 * support for serializing JSX.
 *
 * @this {import('unified').Processor}
 * @type {import('unified').Plugin<[RecmaStringifyOptions | null | undefined] | [], Program, string>}
 */
export function recmaStringify(options) {
  // Always given inside `@mdx-js/mdx`
  /* c8 ignore next */
  const {SourceMapGenerator} = options || {}

  Object.assign(this, {Compiler: compiler})

  /** @type {import('unified').CompilerFunction<Program, string>} */
  function compiler(tree, file) {
    const result = SourceMapGenerator
      ? toJs(tree, {
          filePath: file.path || 'unknown.mdx',
          SourceMapGenerator,
          handlers: jsx
        })
      : toJs(tree, {handlers: jsx})

    file.map = result.map

    return result.value
  }
}
