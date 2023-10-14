import {createLoader} from '../index.js'

// To do: break to not fix by default, remove this file.
const {load} = createLoader({fixRuntimeWithoutExportMap: false})

export {load}
