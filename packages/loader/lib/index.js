/**
 * @typedef {import('@mdx-js/mdx').CompileOptions} CompileOptions
 * @typedef {import('vfile').Compatible} Compatible
 * @typedef {import('vfile').VFile} VFile
 * @typedef {import('vfile-message').VFileMessage} VFileMessage
 * @typedef {import('webpack').Compiler} WebpackCompiler
 * @typedef {import('webpack').LoaderContext<unknown>} LoaderContext
 */

/**
 * @typedef {Pick<CompileOptions, 'SourceMapGenerator'>} Defaults
 *   Defaults.
 * @typedef {Omit<CompileOptions, 'SourceMapGenerator'>} Options
 *   Configuration.
 *
 * @callback Process
 *   Process.
 * @param {Compatible} vfileCompatible
 *   Input.
 * @returns {Promise<VFile>}
 *   File.
 */

import {Buffer} from 'node:buffer'
import {createHash} from 'node:crypto'
import path from 'node:path'
import {createFormatAwareProcessors} from '@mdx-js/mdx/internal-create-format-aware-processors'
import {SourceMapGenerator} from 'source-map'

// Note: the cache is heavily inspired by:
// <https://github.com/TypeStrong/ts-loader/blob/5c030bf/src/instance-cache.ts>
const marker = /** @type {WebpackCompiler} */ ({})
/** @type {WeakMap<WebpackCompiler, Map<string, Process>>} */
const cache = new WeakMap()

/**
 * A Webpack (5+) loader for MDX.
 * See `webpack.cjs`, which wraps this, because Webpack loaders must currently
 * be CommonJS.
 *
 * @this {LoaderContext}
 *   Context.
 * @param {string} value
 *   Value.
 * @param {LoaderContext['callback']} callback
 *   Callback.
 * @returns {undefined}
 *   Nothing.
 */
export function loader(value, callback) {
  /** @type {Defaults} */
  const defaults = this.sourceMap ? {SourceMapGenerator} : {}
  const options = {
    development: this.mode === 'development',
    .../** @type {CompileOptions} */ (this.getOptions())
  }
  const config = {...defaults, ...options}
  const hash = getOptionsHash(options)
  /* c8 ignore next -- some loaders set `undefined` (see `TypeStrong/ts-loader`). */
  const compiler = this._compiler || marker

  if ('renderer' in config) {
    callback(
      new Error(
        '`options.renderer` is no longer supported. Please see <https://mdxjs.com/migrating/v2/> for more information'
      )
    )
    return
  }

  let map = cache.get(compiler)

  if (!map) {
    map = new Map()
    cache.set(compiler, map)
  }

  let process = map.get(hash)

  if (!process) {
    process = createFormatAwareProcessors(config).process
    map.set(hash, process)
  }

  const context = this.context
  const filePath = this.resourcePath

  process({value, path: filePath}).then(
    function (file) {
      callback(
        undefined,
        Buffer.from(file.value),
        // @ts-expect-error: `webpack` is not compiled with `exactOptionalPropertyTypes`,
        // so it does not allow `sourceRoot` in `file.map` to be `undefined` here.
        file.map || undefined
      )
    },
    /**
     * @param {VFileMessage} error
     *   Error.
     * @returns {undefined}
     *   Nothing.
     */
    function (error) {
      const fpath = path.relative(context, filePath)
      error.message = `${fpath}:${error.name}: ${error.message}`
      callback(error)
    }
  )
}

/**
 * @param {Readonly<Options>} options
 *   Configuration.
 * @returns {string}
 *   Hash.
 */
function getOptionsHash(options) {
  const hash = createHash('sha256')
  /** @type {keyof Options} */
  let key

  for (key in options) {
    if (Object.hasOwn(options, key)) {
      const value = options[key]

      if (value !== undefined) {
        const valueString = JSON.stringify(value)
        hash.update(key + valueString)
      }
    }
  }

  return hash.digest('hex').slice(0, 16)
}
