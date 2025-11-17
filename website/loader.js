import {register} from 'node:module'

register('../script/jsx-loader.js', import.meta.url)
register('./mdx-loader.js', import.meta.url)
