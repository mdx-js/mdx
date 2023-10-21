/**
 * @typedef {import('./lib/index.js').Options} Options
 */

import {createLoader} from './lib/index.js'

const defaultLoader = createLoader()

export {createLoader} from './lib/index.js'

/**
 * Load `file:` URLs to MD(X) files.
 */
export const load = defaultLoader.load
