import {createLoader} from 'xdm/esm-loader.js'
import * as babel from '@node-loader/babel'
import config from './xdm-config.js'

const loader = {loaders: [createLoader(config), babel]}

export default loader
