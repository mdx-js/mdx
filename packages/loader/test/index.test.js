/* @jsx React.createElement */
/* @jsxFrag React.Fragment */
import {fileURLToPath} from 'url'
import fs from 'fs'
import webpack from 'webpack'
import React from 'react'
import {renderToString} from 'react-dom/server'
import remarkSlug from 'remark-slug'

const transform = (filePath, options) => {
  return new Promise((resolve, reject) => {
    const compiler = webpack({
      context: fileURLToPath(new URL('.', import.meta.url)),
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
              {loader: fileURLToPath(new URL('..', import.meta.url)), options}
            ]
          }
        ]
      }
    })

    compiler.run(err => {
      if (err) {
        reject(err)
      } else {
        resolve({
          source: fs.readFileSync(
            new URL('../dist/main.js', import.meta.url),
            'utf8'
          )
        })
      }
    })
  })
}

const run = value => {
  // Insinuate return __webpack_exports__ before the final }.
  const i = value.lastIndexOf('}')
  const val = `return ${value.slice(
    0,
    i
  )}return __webpack_exports__${value.slice(i)}`
    // To avoid invalid hook call due to two copies of React: bundled
    // and node_modules.
    .replace('__webpack_require__(4)', 'React')

  // eslint-disable-next-line no-new-func
  return new Function('React', val)(React).default
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
      remarkPlugins: [remarkSlug]
    })
    const Content = run(file.source)

    expect(renderToString(<Content />)).toEqual(
      '<h1 id="hello-world">Hello, world!</h1>'
    )
  })
})
