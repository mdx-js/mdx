import * as serverDomWebpack from 'react-server-dom-webpack/node-loader'
import base from './loader.js'

const loader = {loaders: [serverDomWebpack, ...base.loaders]}

export default loader
