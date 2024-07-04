/**
 * @import {LoadFnOutput, LoadHook, LoadHookContext} from 'node:module'
 * @import {CompileOptions} from '@mdx-js/mdx'
 */

/**
 * @typedef {Parameters<LoadHook>[2]} NextLoad
 *   Next.
 *
 * @typedef {Omit<CompileOptions, 'development'>} Options
 *   Configuration.
 *
 *   Options are the same as `compile` from `@mdx-js/mdx` with the
 *   exception that the `development` option is supported based on
 *   whether you run Node with `--conditions development`.
 *   You cannot pass it manually.
 */

import fs from 'node:fs/promises'
import {createFormatAwareProcessors} from '@mdx-js/mdx/internal-create-format-aware-processors'
import {extnamesToRegex} from '@mdx-js/mdx/internal-extnames-to-regex'
import {SourceMapGenerator} from 'source-map'
import {VFile} from 'vfile'
import {development as defaultDevelopment} from '#condition'

/**
 * Create Node.js hooks to handle markdown and MDX.
 *
 * @param {Readonly<Options> | null | undefined} [options]
 *   Configuration (optional).
 * @returns
 *   Node.js hooks.
 */
export function createLoader(options) {
  const options_ = options || {}
  const {extnames, process} = createFormatAwareProcessors({
    development: defaultDevelopment,
    ...options_,
    SourceMapGenerator
  })
  const regex = extnamesToRegex(extnames)

  return {load}

  /**
   * Load `file:` URLs to MD(X) files.
   *
   * @param {string} href
   *   URL.
   * @param {LoadHookContext} context
   *   Context.
   * @param {NextLoad} nextLoad
   *   Next or default `load` function.
   * @returns {Promise<LoadFnOutput>}
   *   Result.
   * @satisfies {LoadHook}
   */
  async function load(href, context, nextLoad) {
    const url = new URL(href)

    if (url.protocol === 'file:' && regex.test(url.pathname)) {
      const value = await fs.readFile(url)
      const file = await process(new VFile({value, path: url}))

      return {
        format: 'module',
        shortCircuit: true,
        source:
          String(file) +
          '\n//# sourceMappingURL=data:application/json;base64,' +
          Buffer.from(JSON.stringify(file.map)).toString('base64') +
          '\n'
      }
    }

    return nextLoad(href, context)
  }
}
