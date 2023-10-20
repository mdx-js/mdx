/**
 * @typedef {import('@rollup/pluginutils').FilterPattern} FilterPattern
 * @typedef {import('rollup').SourceDescription} SourceDescription
 */

/**
 * @typedef {Omit<import('@mdx-js/mdx').CompileOptions, 'SourceMapGenerator'>} CompileOptions
 *   Default configuration.
 *
 * @typedef RollupPluginOptions
 *   Extra configuration.
 * @property {FilterPattern | null | undefined} [include]
 *   List of picomatch patterns to include (optional).
 * @property {FilterPattern | null | undefined} [exclude]
 *   List of picomatch patterns to exclude (optional).
 *
 * @typedef {CompileOptions & RollupPluginOptions} Options
 *   Configuration.
 */

/**
 * @typedef Plugin
 *   A plugin that is compatible with both Rollup and Vite.
 * @property {string} name
 *   The name of the plugin
 * @property {(config: unknown, env: { mode: string }) => undefined} config
 *   A function used by Vite to set additional configuration options.
 * @property {(value: string, path: string) => Promise<SourceDescription | undefined>} transform
 *   A function to transform the source content.
 */

import {createFormatAwareProcessors} from '@mdx-js/mdx/internal-create-format-aware-processors'
import {createFilter} from '@rollup/pluginutils'
import {SourceMapGenerator} from 'source-map'
import {VFile} from 'vfile'

/**
 * Compile MDX w/ rollup.
 *
 * @param {Readonly<Options> | null | undefined} [options]
 *   Configuration (optional).
 * @return {Plugin}
 *   Rollup plugin.
 */
export function rollup(options) {
  const {exclude, include, ...rest} = options || {}
  /** @type {ReturnType<typeof createFormatAwareProcessors>} */
  let formatAwareProcessors
  const filter = createFilter(include, exclude)

  return {
    name: '@mdx-js/rollup',
    config(config, env) {
      formatAwareProcessors = createFormatAwareProcessors({
        SourceMapGenerator,
        development: env.mode === 'development',
        ...rest
      })
    },
    async transform(value, path) {
      if (!formatAwareProcessors) {
        formatAwareProcessors = createFormatAwareProcessors({
          SourceMapGenerator,
          ...rest
        })
      }

      const file = new VFile({path, value})

      if (
        file.extname &&
        filter(file.path) &&
        formatAwareProcessors.extnames.includes(file.extname)
      ) {
        const compiled = await formatAwareProcessors.process(file)
        const code = String(compiled.value)
        /** @type {SourceDescription} */
        const result = {
          code,
          // @ts-expect-error: `rollup` is not compiled with `exactOptionalPropertyTypes`,
          // so it does not allow `sourceRoot` in `file.map` to be `undefined` here.
          map: compiled.map
        }
        return result
      }
    }
  }
}
