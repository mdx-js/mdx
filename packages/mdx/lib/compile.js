/**
 * @typedef {import('vfile').VFile} VFile
 * @typedef {import('vfile').Compatible} Compatible
 * @typedef {import('./core.js').BaseProcessorOptions} BaseProcessorOptions
 * @typedef {import('./core.js').PluginOptions} PluginOptions
 */

/**
 * @typedef {Omit<BaseProcessorOptions, 'format'>} CoreProcessorOptions
 *   Core configuration.
 *
 * @typedef ExtraOptions
 *   Extra configuration.
 * @property {'detect' | 'md' | 'mdx' | null | undefined} [format='detect']
 *   Format of `file` (default: `'detect'`).
 *
 * @typedef {CoreProcessorOptions & ExtraOptions & PluginOptions} CompileOptions
 *   Configuration.
 */

import {resolveFileAndOptions} from './util/resolve-file-and-options.js'
import {createProcessor} from './core.js'

/**
 * Compile MDX to JS.
 *
 * @param {Readonly<Compatible>} vfileCompatible
 *   MDX document to parse (`string`, `Buffer`, `vfile`, anything that can be
 *   given to `vfile`).
 * @param {Readonly<CompileOptions> | null | undefined} [compileOptions]
 *   Compile configuration (optional).
 * @return {Promise<VFile>}
 *   File.
 */
export function compile(vfileCompatible, compileOptions) {
  const {file, options} = resolveFileAndOptions(vfileCompatible, compileOptions)
  return createProcessor(options).process(file)
}

/**
 * Synchronously compile MDX to JS.
 *
 * @param {Readonly<Compatible>} vfileCompatible
 *   MDX document to parse (`string`, `Buffer`, `vfile`, anything that can be
 *   given to `vfile`).
 * @param {Readonly<CompileOptions> | null | undefined} [compileOptions]
 *   Compile configuration (optional).
 * @return {VFile}
 *   File.
 */
export function compileSync(vfileCompatible, compileOptions) {
  const {file, options} = resolveFileAndOptions(vfileCompatible, compileOptions)
  return createProcessor(options).processSync(file)
}
