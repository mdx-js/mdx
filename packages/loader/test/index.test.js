const path = require('path')
const webpack = require('webpack')
const memoryFs = require('memory-fs')

const testFixture = (fixture, options = {}) => {
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
                presets: ['env', 'stage-0', 'react']
              }
            },
            {
              loader: path.resolve(__dirname, '..')
            }
          ]
        }
      ]
    }
  })

  compiler.outputFileSystem = new memoryFs()

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
  await testFixture('fixture.md')
})
