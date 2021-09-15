/**
 * @typedef {import('react').FC} ReactComponent
 * @typedef {import('preact').FunctionComponent<unknown>} PreactComponent
 * @typedef {import('vue').Component} VueComponent
 * @typedef {import('vue').SetupContext} SetupContext
 */

import {promises as fs} from 'fs'
import {promisify} from 'util'
import {URL, fileURLToPath} from 'url'
import {test} from 'uvu'
import * as assert from 'uvu/assert'
import webpack from 'webpack'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server.js'
import {h} from 'preact'
import {render} from 'preact-render-to-string'
// eslint-disable-next-line import/default
import vue from 'vue'
// eslint-disable-next-line import/default
import serverRenderer from '@vue/server-renderer'

test('@mdx-js/loader', async () => {
  // Setup.
  const base = new URL('./', import.meta.url)

  await fs.writeFile(
    new URL('webpack.mdx', base),
    'export const Message = () => <>World!</>\n\n# Hello, <Message />'
  )

  // React.
  await promisify(webpack)({
    // @ts-expect-error context does not exist on the webpack options types.
    context: fileURLToPath(base),
    entry: './webpack.mdx',
    mode: 'none',
    module: {rules: [{test: /\.mdx$/, use: [fileURLToPath(new URL('../index.cjs', import.meta.url))]}]},
    output: {path: fileURLToPath(base), filename: 'react.cjs', libraryTarget: 'commonjs'}
  })

  // One for ESM loading CJS, one for webpack.
  const ContentReact = /** @type {ReactComponent} */ (
    /* @ts-expect-error file is dynamically generated */
    // type-coverage:ignore-next-line
    (await import('./react.cjs')).default.default
  )

  assert.equal(
    renderToStaticMarkup(React.createElement(ContentReact)),
    '<h1>Hello, World!</h1>',
    'should compile (react)'
  )

  await fs.unlink(new URL('react.cjs', base))

  // Preact.
  await promisify(webpack)({
    // @ts-expect-error context does not exist on the webpack options types.
    context: fileURLToPath(base),
    entry: './webpack.mdx',
    mode: 'none',
    module: {rules: [{
      test: /\.mdx$/,
      use: [
        {
          loader: fileURLToPath(new URL('../index.cjs', import.meta.url)),
          options: {jsxImportSource: 'preact'}
        }
      ]
    }]},
    output: {path: fileURLToPath(base), filename: 'preact.cjs', libraryTarget: 'commonjs'}
  })

  // One for ESM loading CJS, one for webpack.
  const ContentPreact = /** @type {PreactComponent} */ (
    /* @ts-expect-error file is dynamically generated */
    // type-coverage:ignore-next-line
    (await import('./preact.cjs')).default.default
  )

  assert.equal(
    render(h(ContentPreact, {})),
    '<h1>Hello, World!</h1>',
    'should compile (preact)'
  )

  await fs.unlink(new URL('preact.cjs', base))

  // Vue.
  await promisify(webpack)({
    // @ts-expect-error context does not exist on the webpack options types.
    context: fileURLToPath(base),
    entry: './webpack.mdx',
    mode: 'none',
    externals: ['vue'],
    module: {rules: [{
      test: /\.mdx$/,
      use: [
        {loader: 'babel-loader', options: {configFile: false, plugins: ['@vue/babel-plugin-jsx']}},
        {loader: fileURLToPath(new URL('../index.cjs', import.meta.url)), options: {jsx: true}}
      ]
    }]},
    output: {path: fileURLToPath(base), filename: 'vue.cjs', libraryTarget: 'commonjs'}
  })

  // One for ESM loading CJS, one for webpack.
  const ContentVue = /** @type {VueComponent} */ (
    /* @ts-expect-error file is dynamically generated */
    // type-coverage:ignore-next-line
    (await import('./vue.cjs')).default.default
  )

  const vueResult = await serverRenderer.renderToString(vue.createSSRApp({components: {Content: ContentVue}, template: '<Content />'}))


  assert.equal(
    // Remove SSR comments used to hydrate (I guess).
    vueResult.replace(/<!--[[\]]-->/g, ''),
    '<h1>Hello, World!</h1>',
    'should compile (vue)'
  )

  await fs.unlink(new URL('vue.cjs', base))

  // Clean.
  await fs.unlink(new URL('webpack.mdx', base))
})


test.run()
