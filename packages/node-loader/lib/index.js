/**
 * @typedef {import('@mdx-js/mdx/lib/compile.js').CompileOptions} CompileOptions
 */

import path from 'path'
import {URL} from 'url'
import {VFile} from 'vfile'
import {createFormatAwareProcessors} from '@mdx-js/mdx/lib/util/create-format-aware-processors.js'

/**
 * Create smart processors to handle different formats.
 *
 * @param {CompileOptions} [options]
 */
export function createLoader(options) {
  const {extnames, process} = createFormatAwareProcessors(options)

  return {getFormat, transformSource}

  /**
   * @param {string} url
   * @param {unknown} context
   * @param {Function} defaultGetFormat
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
}
