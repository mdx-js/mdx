/**
 * @typedef {import('vfile').VFileCompatible} VFileCompatible
 * @typedef {import('vfile').VFile} VFile
 * @typedef {import('@mdx-js/mdx').CompileOptions} CompileOptions
 * @typedef {Pick<CompileOptions, 'SourceMapGenerator'>} Defaults
 * @typedef {Omit<CompileOptions, 'SourceMapGenerator'>} Options
 * @typedef {import('webpack').LoaderContext<unknown>} LoaderContext
 * @typedef {(vfileCompatible: VFileCompatible) => Promise<VFile>} Process
 */

import {SourceMapGenerator} from 'source-map'
import {createFormatAwareProcessors} from '@mdx-js/mdx/lib/util/create-format-aware-processors.js'

/** @type {WeakMap<CompileOptions, Process>} */
const cache = new WeakMap()

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
  const config = {...defaults, ...options}

  /* Removed option. */
  /* c8 ignore next 5 */
  if ('renderer' in config) {
    throw new Error(
      '`options.renderer` is no longer supported. Please see <https://mdxjs.com/migrating/v2/> for more information'
    )
  }

  let process = cache.get(config)

  if (!process) {
    process = createFormatAwareProcessors(config).process
    cache.set(config, process)
  }

  process({value, path: this.resourcePath}).then((file) => {
    callback(null, file.value, file.map)
    return file
  }, callback)
}
