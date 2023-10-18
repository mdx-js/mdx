/**
 * @typedef {import('webpack').LoaderContext<unknown>} LoaderContext
 */

'use strict'

/**
 * Webpack loader
 *
 * @todo once webpack supports ESM loaders, remove this wrapper.
 *
 * @this {LoaderContext}
 *   Context.
 * @param {string} code
 *   Code.
 * @returns {undefined}
 *   Nothing.
 */
module.exports = function (code) {
  const callback = this.async()
  // Note that `import()` caches, so this should be fast enough.
  import('./lib/index.js').then((module) => {
    return module.loader.call(this, code, callback)
  })
}
