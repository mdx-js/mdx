const path = require('path')
const webpack = require('webpack')
const MemoryFs = require('memory-fs')
const {mount} = require('@vue/test-utils')
const vueMergeProps = require('babel-helper-vue-jsx-merge-props')
const {mdx} = require('../../vue')

// See `loader`’s tests for how to upgrade these to webpack 5.
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
                  plugins: ['babel-plugin-transform-vue-jsx']
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
      /import _mergeJSXProps from "babel-helper-vue-jsx-merge-props";/,
      ''
    )
    .replace(/import \{ mdx } from '@mdx-js\/vue';/, '')
    .replace(/export default/, 'return')

  // eslint-disable-next-line no-new-func
  return new Function('mdx', '_mergeJSXProps', val)(mdx, vueMergeProps)
}

describe('@mdx-js/vue-loader', () => {
  test('should create runnable code', async () => {
    const file = await transform('./fixture.mdx')
    expect(mount(run(file.source)).html()).toEqual('<h1>Hello, world!</h1>')
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

    expect(mount(run(file.source)).html()).toEqual(
      '<h1 id="hello-world">Hello, world!</h1>'
    )
  })
})
