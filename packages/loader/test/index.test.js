/**
 * @typedef {import('react').FC} FC
 */

import {promisify} from 'util'
import path from 'path'
import {promises as fs} from 'fs'
import {test} from 'uvu'
import * as assert from 'uvu/assert'
import webpack from 'webpack'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server.js'

test('@mdx-js/loader', async () => {
  const base = path.resolve(path.join('test'))

  await fs.writeFile(
    path.join(base, 'webpack.mdx'),
    'export const Message = () => <>World!</>\n\n# Hello, <Message />'
  )

  await promisify(webpack)({
    // @ts-expect-error context does not exist on the webpack options types.
    context: base,
    entry: './webpack.mdx',
    mode: 'none',
    module: {rules: [{test: /\.mdx$/, use: [path.resolve('./index.cjs')]}]},
    output: {path: base, filename: 'webpack.cjs', libraryTarget: 'commonjs'}
  })

  // One for ESM loading CJS, one for webpack.
  const Content = /** @type {FC} */ (
    /* @ts-expect-error file is dynamically generated */
    // type-coverage:ignore-next-line
    (await import('./webpack.cjs')).default.default
  )

  assert.equal(
    renderToStaticMarkup(React.createElement(Content)),
    '<h1>Hello, World!</h1>',
    'should compile'
  )

  await fs.unlink(path.join(base, 'webpack.mdx'))
  await fs.unlink(path.join(base, 'webpack.cjs'))
})


test.run()
