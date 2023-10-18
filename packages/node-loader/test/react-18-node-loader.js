import {createLoader} from '@mdx-js/node-loader'

// To do: break to not fix by default, remove this file.
const {load} = createLoader({fixRuntimeWithoutExportMap: false})

export {load}
