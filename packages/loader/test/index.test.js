/* @jsx React.createElement */
/* @jsxFrag React.Fragment */
const path = require('path')
const webpack = require('webpack')
const MemoryFs = require('memory-fs')
const React = require('react')
const {renderToString} = require('react-dom/server')
const _extends = require('@babel/runtime/helpers/extends')
const _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties')
const {mdx} = require('../../react')

const transform = (filePath, options) => {
  return new Promise((resolve, reject) => {
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

    compiler.outputFileSystem = new MemoryFs()

    compiler.run((err, stats) => {
      if (err) {
        reject(err)
      } else {
        resolve(stats.toJson().modules.find(m => m.name === filePath))
      }
    })
  })
}

const run = value => {
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

describe('@mdx-js/loader', () => {
  test('should support a file', async () => {
    const file = await transform('./fixture.mdx')
    const Content = run(file.source)

    expect(renderToString(<Content />)).toEqual('<h1>Hello, world!</h1>')
  })

  test('should handle MDX throwing exceptions', async () => {
    const file = await transform('./fixture.mdx', {remarkPlugins: [1]})

    expect(() => {
      run(file.source)
    }).toThrow(/Expected usable value, not `1`/)
  })

  test('should support options', async () => {
    const file = await transform('./fixture.mdx', {
      remarkPlugins: [require('remark-slug')]
    })
    const Content = run(file.source)

    expect(renderToString(<Content />)).toEqual(
      '<h1 id="hello-world">Hello, world!</h1>'
    )
  })
})
