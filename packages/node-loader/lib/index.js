/**
 * @typedef {import('@mdx-js/mdx/lib/compile.js').CompileOptions} CompileOptions
 */

/**
 * @typedef LoaderOptions
 *   Extra configuration.
 * @property {boolean | null | undefined} [fixRuntimeWithoutExportMap=true]
 *   Several JSX runtimes, notably React below 18 and Emotion below 11.10.0,
 *   don’t yet have a proper export map set up (default: `true`).
 *   Export maps are needed to map `xxx/jsx-runtime` to an actual file in ESM.
 *   This option fixes React et al by turning those into `xxx/jsx-runtime.js`.
 *
 * @typedef {CompileOptions & LoaderOptions} Options
 *   Configuration.
 */

import fs from 'node:fs/promises'
import {createFormatAwareProcessors} from '@mdx-js/mdx/lib/util/create-format-aware-processors.js'
import {extnamesToRegex} from '@mdx-js/mdx/lib/util/extnames-to-regex.js'
import {VFile} from 'vfile'

/**
 * Create smart processors to handle different formats.
 *
 * @param {Readonly<Options> | null | undefined} [options]
 *   Configuration (optional).
 * @returns
 *   Loader.
 */
export function createLoader(options) {
  const options_ = options || {}
  const {extnames, process} = createFormatAwareProcessors(options_)
  const regex = extnamesToRegex(extnames)
  let fixRuntimeWithoutExportMap = options_.fixRuntimeWithoutExportMap

  if (
    fixRuntimeWithoutExportMap === null ||
    fixRuntimeWithoutExportMap === undefined
  ) {
    fixRuntimeWithoutExportMap = true
  }

  return {load, getFormat, transformSource}

  // Node version 17.
  /**
   * @param {string} href
   *   URL.
   * @param {unknown} context
   *   Context.
   * @param {Function} defaultLoad
   *   Default `load` function.
   * @returns
   *   Result.
   */
  async function load(href, context, defaultLoad) {
    const url = new URL(href)

    if (url.protocol === 'file:' && regex.test(url.pathname)) {
      const value = await fs.readFile(url)
      const file = await process(new VFile({value, path: url}))
      let source = String(file)

      /* c8 ignore next 3 -- to do: remove. */
      if (fixRuntimeWithoutExportMap) {
        source = String(file).replace(/\/jsx-runtime(?=["'])/, '$&.js')
      }

      return {format: 'module', shortCircuit: true, source}
    }

    return defaultLoad(href, context, defaultLoad)
  }

  // To do: remove.
  /* c8 ignore start */
  // Pre version 17.
  /**
   * @param {string} href
   *   URL.
   * @param {unknown} context
   *   Context.
   * @param {Function} defaultGetFormat
   *   Default `getFormat` function.
   * @deprecated
   *   This is an obsolete legacy function that no longer works in Node 17.
   * @returns
   *   Result.
   */
  function getFormat(href, context, defaultGetFormat) {
    const url = new URL(href)

    return url.protocol === 'file:' && regex.test(url.pathname)
      ? {format: 'module'}
      : defaultGetFormat(href, context, defaultGetFormat)
  }

  /**
   * @param {string} value
   *   Code.
   * @param {{url: string, [x: string]: unknown}} context
   *   Context.
   * @param {Function} defaultTransformSource
   *   Default `transformSource` function.
   * @deprecated
   *   This is an obsolete legacy function that no longer works in Node 17.
   * @returns
   *   Result.
   */
  async function transformSource(value, context, defaultTransformSource) {
    const url = new URL(context.url)

    if (url.protocol === 'file:' && regex.test(url.pathname)) {
      const file = await process(new VFile({path: new URL(context.url), value}))
      let source = String(file)

      if (fixRuntimeWithoutExportMap) {
        source = String(file).replace(/\/jsx-runtime(?=["'])/, '$&.js')
      }

      return {source}
    }

    return defaultTransformSource(value, context, defaultTransformSource)
  }
  /* c8 ignore end */
}
