/**
 * @typedef {import('@rollup/pluginutils').FilterPattern} FilterPattern
 * @typedef {import('rollup').Plugin} Plugin
 * @typedef {import('rollup').SourceDescription} SourceDescription
 */

/**
 * @typedef {Omit<import('@mdx-js/mdx').CompileOptions, 'SourceMapGenerator'>} CompileOptions
 *   Default configuration.
 *
 * @typedef RollupPluginOptions
 *   Extra configuration.
 * @property {FilterPattern} [include]
 *   List of picomatch patterns to include
 * @property {FilterPattern} [exclude]
 *   List of picomatch patterns to exclude
 *
 * @typedef {CompileOptions & RollupPluginOptions} Options
 *   Configuration.
 */

import {SourceMapGenerator} from 'source-map'
import {VFile} from 'vfile'
import {createFilter} from '@rollup/pluginutils'
import {createFormatAwareProcessors} from '@mdx-js/mdx/lib/util/create-format-aware-processors.js'

/**
 * Compile MDX w/ rollup.
 *
 * @param {Options | null | undefined} [options]
 *   Configuration.
 * @return {Plugin}
 *   Rollup plugin.
 */
export function rollup(options) {
  const {include, exclude, ...rest} = options || {}
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
        const code = String(compiled.value)
        /** @type {SourceDescription} */
        // @ts-expect-error: a) `undefined` is fine, b) `sourceRoot: undefined` is fine too.
        const result = {code, map: compiled.map}
        return result
      }
    }
  }
}
