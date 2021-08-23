import {fileURLToPath} from 'url'
import fs from 'fs'
import webpack from 'webpack'
import {mount} from '@vue/test-utils'
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
                  plugins: ['babel-plugin-transform-vue-jsx']
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

  // eslint-disable-next-line no-new-func
  return new Function(val)().default
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
      remarkPlugins: [remarkSlug]
    })

    expect(mount(run(file.source)).html()).toEqual(
      '<h1 id="hello-world">Hello, world!</h1>'
    )
  })
})
