/**
 * @typedef {import('@mdx-js/mdx/lib/compile.js').CompileOptions} CompileOptions
 *
 * @typedef LoaderOptions
 *   Extra configuration.
 * @property {boolean | null | undefined} [fixRuntimeWithoutExportMap=true]
 *   Several JSX runtimes, notably React below 18 and Emotion below 11.10.0,
 *   don’t yet have a proper export map set up.
 *   Export maps are needed to map `xxx/jsx-runtime` to an actual file in ESM.
 *   This option fixes React et al by turning those into `xxx/jsx-runtime.js`.
 *
 * @typedef {CompileOptions & LoaderOptions} Options
 *   Configuration.
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import {URL, fileURLToPath} from 'node:url'
import {VFile} from 'vfile'
import {createFormatAwareProcessors} from '@mdx-js/mdx/lib/util/create-format-aware-processors.js'

/**
 * Create smart processors to handle different formats.
 *
 * @param {Options | null | undefined} [options]
 */
export function createLoader(options) {
  const options_ = options || {}
  const {extnames, process} = createFormatAwareProcessors(options_)
  let fixRuntimeWithoutExportMap = options_.fixRuntimeWithoutExportMap

  if (
    fixRuntimeWithoutExportMap === null ||
    fixRuntimeWithoutExportMap === undefined
  ) {
    fixRuntimeWithoutExportMap = true
  }

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

    const value = await fs.readFile(fileURLToPath(new URL(url)))
    const file = await process(new VFile({value, path: new URL(url)}))
    let source = String(file)

    if (fixRuntimeWithoutExportMap) {
      source = String(file).replace(/\/jsx-runtime(?=["'])/, '$&.js')
    }

    return {format: 'module', source, shortCircuit: true}
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
    let source = String(file)

    if (fixRuntimeWithoutExportMap) {
      source = String(file).replace(/\/jsx-runtime(?=["'])/, '$&.js')
    }

    return {source}
  }
  /* c8 ignore end */
}
