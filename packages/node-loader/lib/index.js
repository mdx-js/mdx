/**
 * @typedef {import('@mdx-js/mdx').CompileOptions} Options
 */

import fs from 'node:fs/promises'
import {createFormatAwareProcessors} from '@mdx-js/mdx/internal-create-format-aware-processors'
import {extnamesToRegex} from '@mdx-js/mdx/internal-extnames-to-regex'
import {VFile} from 'vfile'
import {development as defaultDevelopment} from '#condition'

/**
 * Create a loader to handle markdown and MDX.
 *
 * @param {Readonly<Options> | null | undefined} [options]
 *   Configuration (optional).
 * @returns
 *   Loader.
 */
export function createLoader(options) {
  const options_ = options || {}
  const {extnames, process} = createFormatAwareProcessors({
    development: defaultDevelopment,
    ...options_
  })
  const regex = extnamesToRegex(extnames)

  return {load}

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

      return {format: 'module', shortCircuit: true, source: String(file)}
    }

    return defaultLoad(href, context, defaultLoad)
  }
}
