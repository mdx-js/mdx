const path = require('path')
const webpack = require('webpack')
const {createFsFromVolume, Volume} = require('memfs')

const testFixture = fixture => {
  const compiler = webpack({
    context: __dirname,
    entry: `./${fixture}`,
    output: {
      path: path.resolve(__dirname),
      filename: 'bundle.js'
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
              loader: path.resolve(__dirname, '..')
            }
          ]
        }
      ]
    }
  })

  compiler.outputFileSystem = createFsFromVolume(new Volume())

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) reject(err)
      if (stats.hasErrors()) reject(new Error(stats.toJson().errors))

      resolve(stats)
    })
  })
}

xtest('it loads markdown and returns a component', async () => {
  const generatedCode = await testFixture('fixture.md')
  expect(generatedCode).toContain('require("@mdx-js/vue")')
})
