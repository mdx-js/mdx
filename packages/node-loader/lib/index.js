/**
 * @typedef {import('@mdx-js/mdx/lib/compile.js').CompileOptions} CompileOptions
 */

import {promises as fs} from 'node:fs'
import path from 'node:path'
import {URL, fileURLToPath} from 'node:url'
import {VFile} from 'vfile'
import {createFormatAwareProcessors} from '@mdx-js/mdx/lib/util/create-format-aware-processors.js'

/**
 * Create smart processors to handle different formats.
 *
 * @param {CompileOptions} [options]
 */
export function createLoader(options) {
  const {extnames, process} = createFormatAwareProcessors(options)

  return {load, getFormat, transformSource}

  /* c8 ignore start */
  // Node version 17.
  /**
   * @param {string} url
   * @param {unknown} context
   * @param {Function} defaultLoad
   */
  async function load(url, context, defaultLoad) {
    if (!extnames.includes(path.extname(url))) {
      return defaultLoad(url, context, defaultLoad)
    }

    const fp = fileURLToPath(new URL(url))
    const value = await fs.readFile(fp)
    const file = await process(new VFile({value, path: new URL(url)}))

    // V8 on Erbium.
    /* c8 ignore next 2 */
    return {
      format: 'module',
      source: String(file).replace(/\/jsx-runtime(?=["'])/g, '$&.js')
    }
  }

  // Pre version 17.
  /**
   * @param {string} url
   * @param {unknown} context
   * @param {Function} defaultGetFormat
   * @deprecated
   *   This is an obsolete legacy function that no longer works in Node 17.
   */
  function getFormat(url, context, defaultGetFormat) {
    return extnames.includes(path.extname(url))
      ? {format: 'module'}
      : defaultGetFormat(url, context, defaultGetFormat)
  }

  /**
   * @param {string} value
   * @param {{url: string, [x: string]: unknown}} context
   * @param {Function} defaultTransformSource
   * @deprecated
   *   This is an obsolete legacy function that no longer works in Node 17.
   */
  async function transformSource(value, context, defaultTransformSource) {
    if (!extnames.includes(path.extname(context.url))) {
      return defaultTransformSource(value, context, defaultTransformSource)
    }

    const file = await process(new VFile({value, path: new URL(context.url)}))
    // V8 on Erbium.
    /* c8 ignore next 2 */
    return {source: String(file).replace(/\/jsx-runtime(?=["'])/g, '$&.js')}
  }
  /* c8 ignore end */
}
