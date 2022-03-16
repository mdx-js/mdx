/**
 * @typedef {import('mdx/types').MDXContent} MDXContent
 * @typedef {import('preact').FunctionComponent<unknown>} PreactComponent
 * @typedef {import('vue').Component} VueComponent
 * @typedef {import('vue').SetupContext} SetupContext
 */

import {promises as fs} from 'fs'
import {promisify} from 'util'
import {fileURLToPath} from 'url'
import {test} from 'uvu'
import * as assert from 'uvu/assert'
import webpack from 'webpack'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {h} from 'preact'
import {render} from 'preact-render-to-string'
import * as vue from 'vue'
import serverRenderer from '@vue/server-renderer'

test('@mdx-js/loader', async () => {
  // Setup.
  const base = new URL('.', import.meta.url)

  await fs.writeFile(
    new URL('webpack.mdx', base),
    'export const Message = () => <>World!</>\n\n# Hello, <Message />'
  )

  // React.
  await promisify(webpack)({
    // @ts-expect-error To do: webpack types miss support for `context`.
    context: fileURLToPath(base),
    entry: './webpack.mdx',
    mode: 'none',
    module: {
      rules: [
        {
          test: /\.mdx$/,
          use: [fileURLToPath(new URL('../index.cjs', import.meta.url))]
        }
      ]
    },
    output: {
      path: fileURLToPath(base),
      filename: 'react.cjs',
      libraryTarget: 'commonjs'
    }
  })

  // One for ESM loading CJS, one for webpack.
  const modReact = /** @type {{default: {default: MDXContent}}} */ (
    // @ts-expect-error file is dynamically generated
    await import('./react.cjs')
  )

  assert.equal(
    renderToStaticMarkup(React.createElement(modReact.default.default)),
    '<h1>Hello, World!</h1>',
    'should compile (react)'
  )

  await fs.unlink(new URL('react.cjs', base))

  // Preact and source maps
  await promisify(webpack)({
    // @ts-expect-error To do: webpack types miss support for `context`.
    context: fileURLToPath(base),
    entry: './webpack.mdx',
    mode: 'development',
    devtool: 'inline-source-map',
    module: {
      rules: [
        {
          test: /\.mdx$/,
          use: [
            {
              loader: fileURLToPath(new URL('../index.cjs', import.meta.url)),
              options: {jsxImportSource: 'preact'}
            }
          ]
        }
      ]
    },
    output: {
      path: fileURLToPath(base),
      filename: 'preact.cjs',
      libraryTarget: 'commonjs'
    }
  })

  // One for ESM loading CJS, one for webpack.
  const modPreact = /** @type {{default: {default: PreactComponent}}} */ (
    // @ts-expect-error file is dynamically generated.
    await import('./preact.cjs')
  )

  assert.equal(
    render(h(modPreact.default.default, {})),
    '<h1>Hello, World!</h1>',
    'should compile (preact)'
  )

  assert.match(
    String(await fs.readFile(new URL('preact.cjs', base))),
    /\/\/# sourceMappingURL/,
    'should add a source map if requested'
  )

  await fs.unlink(new URL('preact.cjs', base))

  // Vue.
  await promisify(webpack)({
    // @ts-expect-error To do: webpack types miss support for `context`.
    context: fileURLToPath(base),
    entry: './webpack.mdx',
    mode: 'none',
    externals: ['vue'],
    module: {
      rules: [
        {
          test: /\.mdx$/,
          use: [
            {
              loader: 'babel-loader',
              options: {configFile: false, plugins: ['@vue/babel-plugin-jsx']}
            },
            {
              loader: fileURLToPath(new URL('../index.cjs', import.meta.url)),
              options: {jsx: true}
            }
          ]
        }
      ]
    },
    output: {
      path: fileURLToPath(base),
      filename: 'vue.cjs',
      libraryTarget: 'commonjs'
    }
  })

  // One for ESM loading CJS, one for webpack.
  const modVue = /** @type {{default: {default: VueComponent}}} */ (
    // @ts-expect-error file is dynamically generated
    await import('./vue.cjs')
  )

  const vueResult = await serverRenderer.renderToString(
    vue.createSSRApp({
      components: {Content: modVue.default.default},
      template: '<Content />'
    })
  )

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
