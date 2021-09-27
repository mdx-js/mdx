'use strict'

const fs = require('fs')
const deasync = require('deasync')

const {runSync} = deasync(load)('@mdx-js/mdx/lib/run.js')
const {createFormatAwareProcessors} = deasync(load)(
  '@mdx-js/mdx/lib/util/create-format-aware-processors.js'
)
const {resolveEvaluateOptions} = deasync(load)(
  '@mdx-js/mdx/lib/util/resolve-evaluate-options.js'
)

module.exports = register

function register(options) {
  const {compiletime, runtime} = resolveEvaluateOptions(options)
  const {extnames, processSync} = createFormatAwareProcessors(compiletime)
  let index = -1

  while (++index < extnames.length) {
    // eslint-disable-next-line node/no-deprecated-api
    require.extensions[extnames[index]] = mdx
  }

  function mdx(module, path) {
    const file = processSync(fs.readFileSync(path))
    const result = runSync(file, runtime)
    module.exports = result.default
    module.loaded = true
  }
}

function load(filePath, callback) {
  let called

  // Sometimes, the import hangs (see error message for reasons).
  // To fix that, a timeout can be used.
  // However, setting a timeout, results in `deasync` waiting for it, even
  // in cases where the import is already settled!
  // That’s why this number is pretty low.
  setTimeout(timeout, 384)

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

  function done(error, result) {
    if (called) return
    called = true
    clearTimeout(timeout)
    callback(error, result)
  }
}
