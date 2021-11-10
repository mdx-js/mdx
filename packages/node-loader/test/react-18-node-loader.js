import {createLoader} from '../index.js'

// Load is for Node 17+, the rest for 12, 14, 16.
const {load, getFormat, transformSource} = createLoader({
  fixRuntimeWithoutExportMap: false
})

export {load, getFormat, transformSource}
