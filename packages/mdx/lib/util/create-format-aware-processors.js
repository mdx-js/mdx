/**
 * @typedef {import('estree-jsx').Program} Program
 * @typedef {import('mdast').Root} Root
 * @typedef {import('unified').Processor<Root, Program, Program, Program, string>} Processor
 * @typedef {import('vfile').Compatible} Compatible
 * @typedef {import('vfile').VFile} VFile
 * @typedef {import('../compile.js').CompileOptions} CompileOptions
 */

import {createProcessor} from '../core.js'
import {md, mdx} from './extnames.js'
import {resolveFileAndOptions} from './resolve-file-and-options.js'

/**
 * Create smart processors to handle different formats.
 *
 * @param {Readonly<CompileOptions> | null | undefined} [compileOptions]
 *   Configuration (optional).
 * @return {{extnames: ReadonlyArray<string>, process: process, processSync: processSync}}
 *   Smart processor.
 */
export function createFormatAwareProcessors(compileOptions) {
  const compileOptions_ = compileOptions || {}
  const mdExtensions = compileOptions_.mdExtensions || md
  const mdxExtensions = compileOptions_.mdxExtensions || mdx
  /** @type {Processor} */
  let cachedMarkdown
  /** @type {Processor} */
  let cachedMdx

  return {
    extnames:
      compileOptions_.format === 'md'
        ? mdExtensions
        : compileOptions_.format === 'mdx'
        ? mdxExtensions
        : [...mdExtensions, ...mdxExtensions],
    process,
    processSync
  }

  /**
   * Smart processor.
   *
   * @param {Compatible} vfileCompatible
   *   MDX or markdown document.
   * @return {Promise<VFile>}
   *   File.
   */
  function process(vfileCompatible) {
    const {file, processor} = split(vfileCompatible)
    return processor.process(file)
  }

  /**
   * Sync smart processor.
   *
   * @param {Compatible} vfileCompatible
   *   MDX or markdown document.
   * @return {VFile}
   *   File.
   */
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
   * @param {Compatible} vfileCompatible
   *   MDX or markdown document.
   * @return {{file: VFile, processor: Processor}}
   *   File and corresponding processor.
   */
  function split(vfileCompatible) {
    const {file, options} = resolveFileAndOptions(
      vfileCompatible,
      compileOptions_
    )
    const processor =
      options.format === 'md'
        ? cachedMarkdown || (cachedMarkdown = createProcessor(options))
        : cachedMdx || (cachedMdx = createProcessor(options))
    return {file, processor}
  }
}
