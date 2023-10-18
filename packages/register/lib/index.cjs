/**
 * @typedef {import('node:module').Module} Module
 */

/**
 * @callback LoadCallback
 *   Callback.
 * @param {Error | undefined} error
 *   Error (optional).
 * @param {unknown} [result]
 *   Module (optional).
 * @returns {void}
 *   Nothing.
 *
 *   Note: `void` needed, `deasync` types don’t accept `undefined`.
 */

// @ts-expect-error: type imports from CJS do work.
/** @typedef {import('@mdx-js/mdx').EvaluateOptions} EvaluateOptions */
// @ts-expect-error: type imports from CJS do work.
/** @typedef {import('@mdx-js/mdx/lib/run.js')} RunMod */
// @ts-expect-error: type imports from CJS do work.
/** @typedef {import('@mdx-js/mdx/lib/util/create-format-aware-processors.js')} CreateProcessorMod */
// @ts-expect-error: type imports from CJS do work.
/** @typedef {import('@mdx-js/mdx/lib/util/resolve-evaluate-options.js')} ResolveEvaluateMod */

'use strict'

const fs = require('node:fs')
const deasync = require('deasync')

const {createFormatAwareProcessors} = /** @type {CreateProcessorMod} */ (
  deasync(load)('@mdx-js/mdx/lib/util/create-format-aware-processors.js')
)
const {resolveEvaluateOptions} = /** @type {ResolveEvaluateMod} */ (
  deasync(load)('@mdx-js/mdx/lib/util/resolve-evaluate-options.js')
)
const {runSync} = /** @type {RunMod} */ (
  deasync(load)('@mdx-js/mdx/lib/run.js')
)

module.exports = register

/**
 * @param {Readonly<EvaluateOptions>} options
 *   Configuration (optional)
 * @returns {undefined}
 *   Nothing.
 */
function register(options) {
  const {compiletime, runtime} = resolveEvaluateOptions(options)
  const {extnames, processSync} = createFormatAwareProcessors(compiletime)
  let index = -1

  while (++index < extnames.length) {
    // eslint-disable-next-line n/no-deprecated-api
    require.extensions[extnames[index]] = mdx
  }

  /**
   * @param {Module} module
   *   Module.
   * @param {string} path
   *   Path.
   * @returns {undefined}
   *   Nothing.
   */
  function mdx(module, path) {
    const file = processSync(fs.readFileSync(path))
    // To do: type `run`.
    /** @type {{default: unknown}} */
    const result = runSync(file, runtime)
    // Something going weird here w/ `type-coverage`.
    // type-coverage:ignore-next-line
    module.exports = result.default
    module.loaded = true
  }
}

/**
 *
 * @param {string} filePath
 *   File path.
 * @param {LoadCallback} callback
 *   Callback.
 * @returns {undefined}
 *   Nothing.
 */
function load(filePath, callback) {
  /** @type {boolean} */
  let called

  // Sometimes, the import hangs (see error message for reasons).
  // To fix that, a timeout can be used.
  const id = setTimeout(timeout, 1024)

  /* c8 ignore start -- something is going wrong in Node/V8 if this happens. */
  function timeout() {
    done(
      new Error(
        'Could not import:\n' +
          "this error can occur when doing `require('@mdx-js/register')` in an async function: please move the require to the top or remove it and use `node -r @mdx-js/register …` instead\n" +
          'this error can also occur if both `@mdx-js/register` and `@mdx-js/esm-loader` are used: please use one or the other'
      )
    )
  }
  /* c8 ignore end */

  import(filePath).then(
    /**
     * @param {unknown} module
     *   Result from calling `import`.
     * @returns {undefined}
     *   Nothing.
     */
    function (module) {
      done(undefined, module)
    },
    done
  )

  /**
   * @param {Error | undefined} error
   *   Error (optional).
   * @param {unknown} [result]
   *   Module (optional).
   * @returns {undefined}
   *   Nothing.
   */
  function done(error, result) {
    /* Something is going wrong in Node/V8 if this happens. */
    /* c8 ignore next */
    if (called) return
    called = true
    clearTimeout(id)
    callback(error, result)
  }
}
