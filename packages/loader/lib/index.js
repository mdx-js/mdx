/**
 * @typedef {import('@mdx-js/mdx').CompileOptions} CompileOptions
 * @typedef {Pick<CompileOptions, 'SourceMapGenerator'>} Defaults
 * @typedef {Omit<CompileOptions, 'SourceMapGenerator'>} Options
 * @typedef {import('webpack').LoaderContext<unknown>} LoaderContext
 */

import {SourceMapGenerator} from 'source-map'
import {compile} from '@mdx-js/mdx'

/**
 * A Webpack (5+) loader for MDX.
 * See `webpack.cjs`, which wraps this, because Webpack loaders must currently
 * be CommonJS.
 *
 * @this {LoaderContext}
 * @param {string} value
 * @param {(error: Error|null|undefined, content?: string|Buffer, map?: Object) => void} callback
 */
export function loader(value, callback) {
  /** @type {Defaults} */
  const defaults = this.sourceMap ? {SourceMapGenerator} : {}
  const options = /** @type {CompileOptions} */ (this.getOptions())

  /* Removed option. */
  /* c8 ignore next 5 */
  if ('renderer' in options) {
    throw new Error(
      '`options.renderer` is no longer supported. Please see <https://mdxjs.com/migrating/v2/> for more information'
    )
  }

  compile({value, path: this.resourcePath}, {...defaults, ...options}).then(
    (file) => {
      // @ts-expect-error conflict between UInt8Array and Buffer is expected, and a tradeoff made in vfile typings to avoid `@types/node` being required
      callback(null, file.value, file.map)
      return file
    },
    callback
  )
}
