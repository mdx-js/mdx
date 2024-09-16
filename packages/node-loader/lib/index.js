/**
 * @import {LoadFnOutput, LoadHook, LoadHookContext} from 'node:module'
 * @import {Process} from '@mdx-js/mdx/internal-create-format-aware-processors'
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
 *
 * @typedef {[regex: RegExp, process: Process]} Settings
 */

import fs from 'node:fs/promises'
import {createFormatAwareProcessors} from '@mdx-js/mdx/internal-create-format-aware-processors'
import {extnamesToRegex} from '@mdx-js/mdx/internal-extnames-to-regex'
import {SourceMapGenerator} from 'source-map'
import {reporter} from 'vfile-reporter'
import {VFile} from 'vfile'
import {development as defaultDevelopment} from '#condition'

/**
 * Create Node.js hooks to handle markdown and MDX.
 *
 * @param {Readonly<Options> | null | undefined} [loaderOptions]
 *   Configuration (optional).
 * @returns
 *   Node.js hooks.
 */
export function createLoader(loaderOptions) {
  /** @type {Settings} */
  let settings = configure(loaderOptions || {})

  return {initialize, load}

  /**
   *
   * @param {Readonly<Options> | null | undefined} options
   */
  async function initialize(options) {
    settings = configure({...loaderOptions, ...options})
  }

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
    const [regex, process] = settings

    if (url.protocol === 'file:' && regex.test(url.pathname)) {
      const value = await fs.readFile(url)
      const file = await process(new VFile({value, path: url}))

      /* c8 ignore next 3 -- hard to test. */
      if (file.messages.length > 0) {
        console.error(reporter(file))
      }

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

/**
 * @param {Readonly<Options>} options
 * @returns {Settings}
 */
function configure(options) {
  const {extnames, process} = createFormatAwareProcessors({
    development: defaultDevelopment,
    ...options,
    SourceMapGenerator
  })
  const regex = extnamesToRegex(extnames)

  return [regex, process]
}
