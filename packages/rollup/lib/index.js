/**
 * @import {FormatAwareProcessors} from '@mdx-js/mdx/internal-create-format-aware-processors'
 * @import {CompileOptions} from '@mdx-js/mdx'
 * @import {FilterPattern} from '@rollup/pluginutils'
 * @import {VFileMessage} from 'vfile-message'
 * @import * as vite from 'vite'
 */

/**
 * @typedef {Omit<CompileOptions, 'SourceMapGenerator'>} ApplicableOptions
 *   Applicable compile configuration.
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
import {createFilter} from '@rollup/pluginutils'
import {SourceMapGenerator} from 'source-map'
import {VFile} from 'vfile'

/**
 * Turn a vfile message into a Rollup log.
 *
 * @param {VFileMessage} message
 *   Message.
 * @returns {vite.Rollup.RollupLog}
 *   Log.
 */
function vfileToRollup(message) {
  /** @type {vite.Rollup.RollupLog} */
  const log = {
    message: message.reason,
    cause: message
  }

  if (
    message.line !== undefined &&
    message.line !== null &&
    message.column !== undefined &&
    message.column !== null
  ) {
    log.loc = {
      file: message.file,
      line: message.line,
      column: message.column
    }
  }

  if (message.source || message.ruleId) {
    let pluginCode = message.source || ''
    if (message.ruleId) {
      if (pluginCode) {
        pluginCode += ':'
      }

      pluginCode += message.ruleId
    }

    log.pluginCode = pluginCode
  }

  return log
}

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
  const filter = createFilter(include, exclude)

  /** @type {vite.Plugin<unknown>} */
  const plugin = {
    name: '@mdx-js/rollup',
    config(config, env) {
      formatAwareProcessors = createFormatAwareProcessors({
        SourceMapGenerator,
        development: env.mode === 'development',
        ...rest
      })
    },
    async transform(value, id) {
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
        filter(file.path) &&
        formatAwareProcessors.extnames.includes(file.extname)
      ) {
        const compiled = await formatAwareProcessors.process(file)

        for (const message of compiled.messages) {
          if (message.fatal === undefined || message.fatal === null) {
            this.info(vfileToRollup(message))
          } else {
            this.warn(vfileToRollup(message))
          }
        }

        const code = String(compiled.value)
        return {code, map: compiled.map}
      }
    }
  }

  return plugin
}
