/**
 * @typedef {import('./lib/index.js').Options} Options
 */

import {createLoader} from './lib/index.js'

const {getFormat, load, transformSource} = createLoader()

export {getFormat, load, transformSource}
export {createLoader} from './lib/index.js'
