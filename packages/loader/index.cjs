/**
 * @typedef {import('webpack').LoaderContext<unknown>} LoaderContext
 * @typedef {import('./lib/index.js', {with: {'resolution-mode': 'import'}}).Options} Options
 */

'use strict'

// Note: we can’t export immediately, as TS generates broken types.
// See: mdx-js/mdx#2386.
module.exports = loader

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
function loader(code) {
  const callback = this.async()
  // Note that `import()` caches, so this should be fast enough.
  import('./lib/index.js').then((module) => {
    return module.loader.call(this, code, callback)
  }, callback)
}
