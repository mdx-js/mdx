/**
 * @typedef {import('vfile').VFileCompatible} VFileCompatible
 * @typedef {import('vfile').VFile} VFile
 * @typedef {import('unified').Processor} Processor
 * @typedef {import('../compile.js').CompileOptions} CompileOptions
 */

import {createProcessor} from '../core.js'
import {md, mdx} from './extnames.js'
import {resolveFileAndOptions} from './resolve-file-and-options.js'

/**
 * Create smart processors to handle different formats.
 *
 * @param {CompileOptions} [compileOptions]
 * @return {{extnames: Array<string>, process: process, processSync: processSync}}
 */
export function createFormatAwareProcessors(compileOptions = {}) {
  const mdExtensions = compileOptions.mdExtensions || md
  const mdxExtensions = compileOptions.mdxExtensions || mdx
  /** @type {Processor} */
  let cachedMarkdown
  /** @type {Processor} */
  let cachedMdx

  return {
    extnames:
      compileOptions.format === 'md'
        ? mdExtensions
        : compileOptions.format === 'mdx'
        ? mdxExtensions
        : mdExtensions.concat(mdxExtensions),
    process,
    processSync
  }

  /**
   * Smart processor.
   *
   * @param {VFileCompatible} vfileCompatible
   *   MDX or markdown document.
   * @return {Promise<VFile>}
   */
  function process(vfileCompatible) {
    const {file, processor} = split(vfileCompatible)
    return processor.process(file)
  }

  /**
   * Sync smart processor.
   *
   * @param {VFileCompatible} vfileCompatible
   *   MDX or markdown document.
   * @return {VFile}
   */
  // C8 does not cover `.cjs` files (this is only used for the require hook,
  // which has to be CJS).
  /* c8 ignore next 4 */
  function processSync(vfileCompatible) {
    const {file, processor} = split(vfileCompatible)
    return processor.processSync(file)
  }

  /**
   * Make a full vfile from what’s given, and figure out which processor
   * should be used for it.
   * This caches processors (one for markdown and one for MDX) so that they do
   * not have to be reconstructed for each file.
   *
   * @param {VFileCompatible} vfileCompatible
   *   MDX or markdown document.
   * @return {{file: VFile, processor: Processor}}
   */
  function split(vfileCompatible) {
    const {file, options} = resolveFileAndOptions(
      vfileCompatible,
      compileOptions
    )
    const processor =
      options.format === 'md'
        ? cachedMarkdown || (cachedMarkdown = createProcessor(options))
        : cachedMdx || (cachedMdx = createProcessor(options))
    return {file, processor}
  }
}
