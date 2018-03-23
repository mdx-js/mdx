import test from 'ava'
import path from 'path'
import webpack from 'webpack'
import memoryFs from 'memory-fs'

const testFixture = (fixture, options = {}) => {
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
      rules: [{
        test: /\.md?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                "env",
                "es2015",
                "stage-0",
                "react"
              ],
              plugins: [
                "transform-runtime"
              ]
            }
          },
          {
            loader: path.resolve(__dirname, './')
          }
        ]
      }]
    }
  })

  compiler.outputFileSystem = new memoryFs()

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) reject(err)

      resolve(stats)
    })
  })
}

test('it loads markdown and returns a component', async t => {
   const stats = await testFixture('fixture.md')

   const result = stats.toJson().modules[0].source

   t.snapshot(result)
})
