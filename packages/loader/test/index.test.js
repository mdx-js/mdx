/**
 * @typedef {import('react').FC} ReactFunctionComponent
 * @typedef {import('preact').FunctionComponent<unknown>} PreactFunctionComponent
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

test('@mdx-js/loader', async () => {
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
  const ContentReact = /** @type {ReactFunctionComponent} */ (
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
  const ContentPreact = /** @type {PreactFunctionComponent} */ (
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

  await fs.unlink(new URL('webpack.mdx', base))
})


test.run()
