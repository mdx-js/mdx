#!/usr/bin/env node
import url from 'url'
import process from 'process'
import webpack from 'webpack'
import ReactServerWebpackPlugin from 'react-server-dom-webpack/plugin'
import xdmConfig from './xdm-config.js'
import {config} from '../docs/_config.js'

const production = process.env.NODE_ENV === 'production'

webpack(
  {
    mode: production ? 'production' : 'development',
    devtool: production ? 'source-map' : 'cheap-module-source-map',
    entry: [
      url.fileURLToPath(
        new URL('../docs/_asset/index.client.js', import.meta.url)
      )
    ],
    output: {
      // RSC puts all chunks in `public/` (perhaps due to my weird doing),
      // but on a page `public/folder/index.html`, RSC/WP will then load
      // `public/folder/chunk.js`, even though it’s at `public/chunk.js`.
      // This fixes that!
      publicPath: '/',
      path: url.fileURLToPath(config.output),
      filename: 'index.js'
    },
    module: {
      rules: [
        {test: /\.mdx$/, use: {loader: 'xdm/webpack.cjs', options: xdmConfig}},
        {test: /\.js$/, use: 'babel-loader', exclude: /node_modules/}
      ]
    },
    plugins: [new ReactServerWebpackPlugin({isServer: false})]
  },
  (error, stats) => {
    const info = stats && stats.toJson()

    if (error) throw error

    if (stats.hasErrors()) {
      for (error of info.errors) console.error(error)
      throw new Error('Finished running webpack with errors')
    }

    console.log('✔ Bundle')
  }
)
