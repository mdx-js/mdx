/**
 * @typedef {import('vfile').VFile} VFile
 * @typedef {import('vfile').VFileCompatible} VFileCompatible
 * @typedef {import('./core.js').PluginOptions} PluginOptions
 * @typedef {import('./core.js').BaseProcessorOptions} BaseProcessorOptions
 */

/**
 * @typedef {Omit<BaseProcessorOptions, 'format'>} CoreProcessorOptions
 *   Core configuration.
 *
 * @typedef ExtraOptions
 *   Extra configuration.
 * @property {'detect' | 'mdx' | 'md' | null | undefined} [format='detect']
 *   Format of `file`.
 *
 * @typedef {CoreProcessorOptions & PluginOptions & ExtraOptions} CompileOptions
 *   Configuration.
 */

import {createProcessor} from './core.js'
import {resolveFileAndOptions} from './util/resolve-file-and-options.js'

/**
 * Compile MDX to JS.
 *
 * @param {VFileCompatible} vfileCompatible
 *   MDX document to parse (`string`, `Buffer`, `vfile`, anything that can be
 *   given to `vfile`).
 * @param {CompileOptions | null | undefined} [compileOptions]
 *   Compile configuration.
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
 * @param {VFileCompatible} vfileCompatible
 *   MDX document to parse (`string`, `Buffer`, `vfile`, anything that can be
 *   given to `vfile`).
 * @param {CompileOptions | null | undefined} [compileOptions]
 *   Compile configuration.
 * @return {VFile}
 *   File.
 */
export function compileSync(vfileCompatible, compileOptions) {
  const {file, options} = resolveFileAndOptions(vfileCompatible, compileOptions)
  return createProcessor(options).processSync(file)
}
