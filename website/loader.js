import {createLoader as createMdxLoader} from '@mdx-js/node-loader'
import {createLoader as createJsxLoader} from '../script/jsx-loader.js'
import config from './mdx-config.js'

const loader = {loaders: [createJsxLoader(), createMdxLoader(config)]}

export default loader
