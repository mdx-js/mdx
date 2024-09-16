import {createLoader as createJsxLoader} from '../script/jsx-loader.js'
import {initialize, load} from './mdx-loader.js'

const loader = {loaders: [createJsxLoader(), {initialize, load}]}
export default loader

// To do: after dropping Node 18:
// import {register} from 'node:module'

// register('../script/jsx-loader.js', import.meta.url)
// register('./mdx-loader.js', import.meta.url)
