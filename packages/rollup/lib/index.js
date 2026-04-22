/**
 * @import {FormatAwareProcessors} from '@mdx-js/mdx/internal-create-format-aware-processors'
 * @import {CompileOptions} from '@mdx-js/mdx'
 * @import * as vite from 'vite'
 */

/**
 * @typedef {Omit<CompileOptions, 'SourceMapGenerator'>} ApplicableOptions
 *   Applicable compile configuration.
 *
 * @typedef {string | RegExp | Array<string | RegExp>} FilterPattern
 *   A Rollup filter pattern.
 *
 * @typedef ExtraOptions
 *   Extra configuration.
 * @property {FilterPattern | null | undefined} [exclude]
 *   Picomatch patterns to exclude (optional).
 * @property {FilterPattern | null | undefined} [include]
 *   Picomatch patterns to include (optional).
 *
 * @typedef {ApplicableOptions & ExtraOptions} Options
 *   Configuration.
 *
 * @typedef Plugin
 *   Plugin that is compatible with both Rollup and Vite.
 * @property {string} name
 *   The name of the plugin
 */

import {createFormatAwareProcessors} from '@mdx-js/mdx/internal-create-format-aware-processors'
import {SourceMapGenerator} from 'source-map'
import {VFile} from 'vfile'

/**
 * Plugin to compile MDX w/ rollup.
 *
 * @param {Readonly<Options> | null | undefined} [options]
 *   Configuration (optional).
 * @return {Plugin}
 *   Rollup plugin.
 */
export function rollup(options) {
  const {exclude, include, ...rest} = options || {}
  /** @type {FormatAwareProcessors} */
  let formatAwareProcessors

  /** @type {vite.Plugin<never>} */
  const plugin = {
    name: '@mdx-js/rollup',
    config(config, env) {
      formatAwareProcessors = createFormatAwareProcessors({
        SourceMapGenerator,
        development: env.mode === 'development',
        ...rest
      })
    },
    transform: {
      filter: {
        id: {
          include: /** @type {FilterPattern} */ (include),
          exclude: /** @type {FilterPattern} */ (exclude)
        }
      },
      async handler(value, id) {
        if (!formatAwareProcessors) {
          formatAwareProcessors = createFormatAwareProcessors({
            SourceMapGenerator,
            ...rest
          })
        }

        const [path] = id.split('?')
        const file = new VFile({path, value})

        if (
          file.extname &&
          formatAwareProcessors.extnames.includes(file.extname)
        ) {
          const compiled = await formatAwareProcessors.process(file)
          const code = String(compiled.value)
          return {code, map: compiled.map}
        }
      }
    }
  }

  return plugin
}
