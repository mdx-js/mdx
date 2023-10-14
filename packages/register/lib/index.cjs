/**
 * @typedef {import('node:module').Module} Module
 */

// @ts-expect-error: type imports do work.
/** @typedef {import('@mdx-js/mdx').EvaluateOptions} EvaluateOptions */
// @ts-expect-error: type imports do work.
/** @typedef {import('@mdx-js/mdx/lib/run.js')} RunMod */
// @ts-expect-error: type imports do work.
/** @typedef {import('@mdx-js/mdx/lib/util/create-format-aware-processors.js')} CreateProcessorMod */
// @ts-expect-error: type imports do work.
/** @typedef {import('@mdx-js/mdx/lib/util/resolve-evaluate-options.js')} ResolveEvaluateMod */

'use strict'

const fs = require('fs')
const deasync = require('deasync')

/** @type {RunMod} */
const {runSync} = deasync(load)('@mdx-js/mdx/lib/run.js')
/** @type {CreateProcessorMod} */
const {createFormatAwareProcessors} = deasync(load)(
  '@mdx-js/mdx/lib/util/create-format-aware-processors.js'
)
/** @type {ResolveEvaluateMod} */
const {resolveEvaluateOptions} = deasync(load)(
  '@mdx-js/mdx/lib/util/resolve-evaluate-options.js'
)

module.exports = register

/**
 * @param {EvaluateOptions} options
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
   * @param {string} path
   * @returns {undefined}
   */
  function mdx(module, path) {
    const file = processSync(fs.readFileSync(path))
    const result = runSync(file, runtime)
    module.exports = result.default
    module.loaded = true
  }
}

/**
 *
 * @param {string} filePath
 * @param {(error: Error | null, result?: any) => void} callback
 *   Note: `void` needed, `deasync` types don’t accept `undefined`.
 * @returns {undefined}
 */
function load(filePath, callback) {
  /** @type {boolean} */
  let called

  // Sometimes, the import hangs (see error message for reasons).
  // To fix that, a timeout can be used.
  const id = setTimeout(timeout, 1024)

  /* Something is going wrong in Node/V8 if this happens. */
  /* c8 ignore next 10 */
  function timeout() {
    done(
      new Error(
        'Could not import:\n' +
          "this error can occur when doing `require('@mdx-js/register')` in an async function: please move the require to the top or remove it and use `node -r @mdx-js/register …` instead\n" +
          'this error can also occur if both `@mdx-js/register` and `@mdx-js/esm-loader` are used: please use one or the other'
      )
    )
  }

  import(filePath).then((module) => {
    done(null, module)
  }, done)

  /**
   *
   * @param {Error | null} error
   * @param {unknown} [result]
   * @returns {undefined}
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
