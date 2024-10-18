/**
 * @import {MDXContent} from 'mdx/types.js'
 */

import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import {test} from 'node:test'
import {promisify} from 'node:util'
import {fileURLToPath} from 'node:url'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import webpackCallback from 'webpack'

const webpack = await promisify(webpackCallback)

test('@mdx-js/loader', async function (t) {
  await t.test('should expose the public api', async function () {
    const keys = Object.keys(await import('@mdx-js/loader'))
      .sort()
      // To do: when Node 23 is the lowest baseline,
      // drop this.
      .filter((key) => key !== 'module.exports')

    assert.deepEqual(keys, ['default'])
  })

  await t.test('should work', async function () {
    const folderUrl = new URL('./', import.meta.url)
    const mdxUrl = new URL('webpack.mdx', import.meta.url)
    const jsUrl = new URL('webpack.cjs', import.meta.url)

    await fs.writeFile(
      mdxUrl,
      'export function Message() { return <>World!</> }\n\n# Hello, <Message />'
    )

    const result = await webpack({
      // @ts-expect-error: webpack types do not include `context`, which does work.
      context: fileURLToPath(folderUrl),
      entry: './webpack.mdx',
      mode: 'none',
      module: {rules: [{test: /\.mdx$/, use: ['@mdx-js/loader']}]},
      output: {
        filename: 'webpack.cjs',
        libraryTarget: 'commonjs',
        path: fileURLToPath(folderUrl)
      }
    })

    assert(result)
    assert.ok(!result.hasErrors())

    // One for ESM loading CJS, one for webpack.
    const moduleResult = /** @type {{default: {default: MDXContent}}} */ (
      await import(jsUrl.href + '#' + Math.random())
    )
    const Content = moduleResult.default.default

    assert.equal(
      renderToStaticMarkup(React.createElement(Content)),
      '<h1>Hello, World!</h1>'
    )

    const output = String(await fs.readFile(jsUrl))

    assert.doesNotMatch(
      output,
      /react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_\d+__\.jsxDEV/
    )

    assert.doesNotMatch(output, /\/\/# sourceMappingURL/)

    await fs.rm(mdxUrl)
    await fs.rm(jsUrl)
  })

  await t.test(
    'should support source maps and development mode',
    async function () {
      const folderUrl = new URL('./', import.meta.url)
      const mdxUrl = new URL('webpack.mdx', import.meta.url)
      const jsUrl = new URL('webpack.cjs', import.meta.url)

      await fs.writeFile(
        mdxUrl,
        'export function Message() { return <>World!</> }\n\n# Hello, <Message />'
      )

      const result = await webpack({
        // @ts-expect-error: webpack types do not include `context`, which does work.
        context: fileURLToPath(folderUrl),
        devtool: 'inline-source-map',
        entry: './webpack.mdx',
        mode: 'development',
        module: {rules: [{test: /\.mdx$/, use: ['@mdx-js/loader']}]},
        output: {
          filename: 'webpack.cjs',
          libraryTarget: 'commonjs',
          path: fileURLToPath(folderUrl)
        }
      })

      assert(result)
      assert.ok(!result.hasErrors())

      const output = String(await fs.readFile(jsUrl))

      assert.match(
        output,
        /react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_\d+__\.jsxDEV/
      )

      assert.match(output, /\/\/# sourceMappingURL/)

      await fs.rm(mdxUrl)
      await fs.rm(jsUrl)
    }
  )

  await t.test('should emit an error', async function () {
    const folderUrl = new URL('./', import.meta.url)
    const mdxUrl = new URL('webpack.mdx', import.meta.url)

    await fs.writeFile(mdxUrl, '# Hello, {<Message />')

    const result = await webpack({
      // @ts-expect-error: webpack types do not include `context`, which does work.
      context: fileURLToPath(folderUrl),
      entry: './webpack.mdx',
      mode: 'none',
      module: {rules: [{test: /\.mdx$/, use: ['@mdx-js/loader']}]},
      output: {
        filename: 'webpack.cjs',
        libraryTarget: 'commonjs',
        path: fileURLToPath(folderUrl)
      }
    })

    assert(result)
    const errors = result.toJson().errors || []
    const error = errors[0]

    assert.equal(
      error.message,
      `Module build failed (from ../index.cjs):
webpack.mdx:1:22: Unexpected end of file in expression, expected a corresponding closing brace for \`{\``,
      'received expected error message'
    )

    await fs.rm(mdxUrl)
    await fs.rm(new URL('webpack.cjs', folderUrl))
  })

  await t.test(
    'should support source maps and development mode',
    async function () {
      const folderUrl = new URL('./', import.meta.url)
      const mdxUrl = new URL('webpack.mdx', import.meta.url)
      const jsUrl = new URL('webpack.cjs', import.meta.url)

      await fs.writeFile(
        mdxUrl,
        'export function Message() { return <>World!</> }\n\n# Hello, <Message />'
      )

      const result = await webpack({
        // @ts-expect-error: webpack types do not include `context`, which does work.
        context: fileURLToPath(folderUrl),
        devtool: 'inline-source-map',
        entry: './webpack.mdx',
        mode: 'development',
        module: {rules: [{test: /\.mdx$/, use: ['@mdx-js/loader']}]},
        output: {
          filename: 'webpack.cjs',
          libraryTarget: 'commonjs',
          path: fileURLToPath(folderUrl)
        }
      })

      assert(result)
      assert.ok(!result.hasErrors())

      const output = String(await fs.readFile(jsUrl))

      assert.match(
        output,
        /react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_\d+__\.jsxDEV/
      )

      assert.match(output, /\/\/# sourceMappingURL/)

      await fs.rm(mdxUrl)
      await fs.rm(jsUrl)
    }
  )

  await t.test('should throw for `renderer`', async function () {
    const folderUrl = new URL('./', import.meta.url)
    const mdxUrl = new URL('webpack.mdx', import.meta.url)

    await fs.writeFile(mdxUrl, '\ta')

    const result = await webpack({
      // @ts-expect-error: webpack types do not include `context`, which does work.
      context: fileURLToPath(folderUrl),
      entry: './webpack.mdx',
      mode: 'none',
      module: {
        rules: [
          {
            test: /\.mdx$/,
            use: [{loader: '@mdx-js/loader', options: {renderer: '?'}}]
          }
        ]
      },
      output: {
        filename: 'webpack.cjs',
        libraryTarget: 'commonjs',
        path: fileURLToPath(folderUrl)
      }
    })

    assert(result)
    const errors = result.toJson().errors || []
    const error = errors[0]

    assert.match(error.message, /`options.renderer` is no longer supported/)

    await fs.rm(mdxUrl)
    await fs.rm(new URL('webpack.cjs', folderUrl))
  })
})
