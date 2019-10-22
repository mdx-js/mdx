const fixtures = require('./fixtures/')

const babel = require('@babel/core')
const BabelPluginExtractImportNames = require('..')

const transform = str => {
  const plugin = new BabelPluginExtractImportNames()

  babel.transform(str, {
    configFile: false,
    plugins: ['@babel/plugin-syntax-jsx', plugin.plugin]
  })

  return plugin.state
}

fixtures.forEach(fixture => {
  it(fixture.description, () => {
    expect(transform(fixture.mdx)).toMatchSnapshot(fixture.result)
  })
})
