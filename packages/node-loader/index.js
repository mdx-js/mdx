/**
 * @typedef {import('./lib/index.js').CompileOptions} Options
 */

import {createLoader} from './lib/index.js'

const {getFormat, transformSource} = createLoader()

export {getFormat, transformSource, createLoader}
