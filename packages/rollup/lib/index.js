/**
 * @typedef {import('@rollup/pluginutils').FilterPattern} FilterPattern
 * @typedef {Omit<import('@mdx-js/mdx').CompileOptions, 'SourceMapGenerator'>} CompileOptions
 * @typedef {import('rollup').Plugin} Plugin
 *
 * @typedef RollupPluginOptions
 * @property {FilterPattern} [include]
 *   List of picomatch patterns to include
 * @property {FilterPattern} [exclude]
 *   List of picomatch patterns to exclude
 *
 * @typedef {CompileOptions & RollupPluginOptions} Options
 */

import {SourceMapGenerator} from 'source-map'
import {VFile} from 'vfile'
import {createFilter} from '@rollup/pluginutils'
import {createFormatAwareProcessors} from '@mdx-js/mdx/lib/util/create-format-aware-processors.js'

/**
 * Compile MDX w/ rollup.
 *
 * @param {Options} [options]
 * @return {Plugin}
 */
export function rollup(options = {}) {
  const {include, exclude, ...rest} = options
  const {extnames, process} = createFormatAwareProcessors({
    SourceMapGenerator,
    ...rest
  })
  const filter = createFilter(include, exclude)

  return {
    name: '@mdx-js/rollup',
    async transform(value, path) {
      const file = new VFile({value, path})

      if (
        file.extname &&
        filter(file.path) &&
        extnames.includes(file.extname)
      ) {
        const compiled = await process(file)
        return {code: String(compiled.value), map: compiled.map}
        // V8 on Erbium.
        /* c8 ignore next 2 */
      }
    }
  }
}
