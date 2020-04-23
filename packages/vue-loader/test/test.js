const path = require('path')
const fs = require('fs').promises
const {transformAsync} = require('@babel/core')

const loader = require('..')

const testFixture = async fixture => {
  const str = await fs.readFile(path.join(__dirname, fixture), 'utf-8')

  let result
  await loader.bind({
    async: () => (err, res) => {
      if (err) {
        throw err
      }

      result = res
    }
  })(str)
  const {code} = await transformAsync(result, {
    presets: ['@babel/preset-env'],
    plugins: ['transform-vue-jsx']
  })

  return code
}

test('it loads markdown and returns a component', async () => {
  const generatedCode = await testFixture('fixture.md')
  expect(generatedCode).toContain('require("@mdx-js/vue")')
})
