import {createLoader} from '@mdx-js/node-loader'
import * as babel from '@node-loader/babel'
import config from './mdx-config.js'

const loader = {loaders: [createLoader(config), babel]}

export default loader
