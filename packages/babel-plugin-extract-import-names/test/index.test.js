const babel = require('@babel/core')

const BabelPluginExtractImportNames = require('..')

const FIXTURE = `
import Foo from 'bar'
import { Bar, Baz } from 'qux'
`

const transform = str => {
  const plugin = new BabelPluginExtractImportNames()

  const result = babel.transform(str, {
    configFile: false,
    plugins: [plugin.plugin]
  })

  return {
    ...result,
    state: plugin.state
  }
}

describe('babel-plugin-add-mdx-type-prop', () => {
  test('adds import names to state', () => {
    const result = transform(FIXTURE)

    expect(result.state.names).toEqual(['Foo', 'Bar', 'Baz'])
  })
})
