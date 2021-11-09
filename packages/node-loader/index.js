/**
 * @typedef {import('./lib/index.js').CompileOptions} Options
 */

import {createLoader} from './lib/index.js'

const {load, getFormat, transformSource} = createLoader()

export {load, getFormat, transformSource, createLoader}
