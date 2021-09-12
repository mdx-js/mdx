const {test} = require('uvu')
const assert = require('uvu/assert')
const path = require('path')
const webpack = require('webpack')
const MemoryFs = require('memory-fs')
const React = require('react')
const {renderToString} = require('react-dom/server')
const _extends = require('@babel/runtime/helpers/extends')
const _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties')
const {mdx} = require('../../react')

const transform = (filePath, options) =>
  new Promise((resolve, reject) => {
    // Webpack 5: const fs = new MemoryFs()
    const compiler = webpack({
      context: __dirname,
      entry: filePath,
      mode: 'none',
      module: {
        rules: [
          {
            test: /\.mdx$/,
            use: [
              {
                loader: 'babel-loader',
                options: {
                  configFile: false,
                  plugins: [
                    '@babel/plugin-transform-runtime',
                    '@babel/plugin-syntax-jsx',
                    '@babel/plugin-transform-react-jsx'
                  ]
                }
              },
              {loader: path.resolve(__dirname, '..'), options}
            ]
          }
        ]
      }
    })

    // Webpack 5: compiler.outputFileSystem = fs
    compiler.outputFileSystem = new MemoryFs()

    compiler.run((err, stats) => {
      if (err) {
        reject(err)
      } else {
        // Webpack 5:
        // resolve(
        //   {source: fs.readFileSync(path.join(__dirname, '..', 'dist', 'main.js'), 'utf8')}
        // )
        resolve(stats.toJson().modules.find(m => m.name === filePath))
      }
    })
  })

const run = value => {
  // Webpack 5 (replace everything in this function with):
  // const val = 'return ' + value.replace(/__webpack_require__\(0\)/, 'return $&')
  //
  // // eslint-disable-next-line no-new-func
  // return new Function(val)().default
  // Replace import/exports w/ parameters and return value.
  const val = value
    .replace(
      /import _objectWithoutProperties from "@babel\/runtime\/helpers\/objectWithoutProperties";/,
      ''
    )
    .replace(/import _extends from "@babel\/runtime\/helpers\/extends";/, '')
    .replace(/import React from 'react';/, '')
    .replace(/import \{ mdx } from '@mdx-js\/react';/, '')
    .replace(/export default/, 'return')

  // eslint-disable-next-line no-new-func
  return new Function(
    'mdx',
    'React',
    '_extends',
    '_objectWithoutProperties',
    val
  )(mdx, React, _extends, _objectWithoutProperties)
}

test('should support a file', async () => {
  const file = await transform('./fixture.mdx')
  const Content = run(file.source)

  assert.equal(
    renderToString(React.createElement(Content)),
    '<h1>Hello, world!</h1>'
  )
})

test('should handle MDX not compiling', async () => {
  const file = await transform('./broken-fixture.mdx')

  assert.throws(() => {
    run(file.source)
  }, /Unexpected end of file/)
})

test('should handle MDX throwing exceptions', async () => {
  const file = await transform('./fixture.mdx', {remarkPlugins: [1]})

  assert.throws(() => {
    run(file.source)
  }, /Expected usable value, not `1`/)
})

test('should support options', async () => {
  const file = await transform('./fixture.mdx', {
    remarkPlugins: [require('remark-slug')]
  })
  const Content = run(file.source)

  assert.equal(
    renderToString(React.createElement(Content)),
    '<h1 id="hello-world">Hello, world!</h1>'
  )
})

test.run()
