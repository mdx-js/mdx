const path = require('path')
const webpack = require('webpack')
const MemoryFs = require('memory-fs')
const {VueJSXCompiler} = require('@mdx-js/vue')

const testFixture = fixture => {
  const fileName = `./${fixture}`

  const compiler = webpack({
    context: __dirname,
    entry: `./${fixture}`,
    output: {
      path: path.resolve(__dirname),
      filename: 'bundle.js'
    },
    node: {
      fs: 'empty'
    },
    module: {
      rules: [
        {
          test: /\.md?$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env'],
                plugins: ['transform-vue-jsx']
              }
            },
            {
              loader: path.resolve(__dirname, '..'),
              options: {
                compilers: [VueJSXCompiler]
              }
            }
          ]
        }
      ]
    }
  })

  compiler.outputFileSystem = new MemoryFs()

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) reject(err)

      const module = stats.toJson().modules.find(m => m.name === fileName)
        .source

      resolve(module)
    })
  })
}

test('it loads markdown and returns a component', async () => {
  const generatedCode = await testFixture('fixture.md')
  expect(generatedCode).toContain('require("@mdx-js/vue")')
})
