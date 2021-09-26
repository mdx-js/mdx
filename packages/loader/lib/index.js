/**
 * @todo support given source map, meta? <https://webpack.js.org/api/loaders/>
 * @todo always add a source map.
 *
 * @typedef {import('webpack').LoaderContext<unknown>} LoaderContext
 */

import {getOptions} from 'loader-utils'
import {compile} from '@mdx-js/mdx'

/**
 * A Webpack (4+) loader for MDX.
 * See `webpack.cjs`, which wraps this, because Webpack loaders must currently
 * be CommonJS.
 * `file.map` is defined when a `SourceMapGenerator` is passed in options.
 *
 * @this {LoaderContext}
 * @param {string} value
 * @param {(error: Error|null|undefined, content?: string|Buffer, map?: Object) => void} callback
 */
export function loader(value, callback) {
  // @ts-expect-error: types for webpack/loader-utils are out of sync.
  const options = {...getOptions(this)}

  /* c8 ignore next 5 */
  if ('renderer' in options) {
    throw new Error(
      '`options.renderer` is no longer supported. Please see <https://mdxjs.com/migrating/v2/> for more information'
    )
  }

  compile({value, path: this.resourcePath}, options).then((file) => {
    // @ts-expect-error conflict between UInt8Array and Buffer is expected, and a tradeoff made in vfile typings to avoid `@types/node` being required
    callback(null, file.value, file.map)
    return file
  }, callback)
}
