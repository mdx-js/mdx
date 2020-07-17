const babel = require('@babel/core')

const BabelPluginExtractExportNames = require('..')

const FIXTURE = `
export const foo = 'bar'
export const foo2 = {
  bar: 'baze',
  hi: \`Hello! \${foo.toJSON() || 'hrm'}\`,
  abc: {
    def: 123
  }
}
export const foo3 = [1, 2, 3, { a: 'b' }]
export const A = 'baz'
export const [B] = [1]
export const [C, D, E] = [a, { b: 'c' }]
export const { F } = { foo: 'bar' }
export const { G, H } = {}
export { Super } from './super'
`

const transform = str => {
  const plugin = new BabelPluginExtractExportNames()

  const result = babel.transform(str, {
    configFile: false,
    plugins: [plugin.plugin]
  })

  return {
    ...result,
    state: plugin.state
  }
}

describe('babel-plugin-extract-export-names', () => {
  test('adds export names to state', () => {
    const result = transform(FIXTURE)

    expect(result.state.names).toEqual(['foo', 'foo2', 'foo3', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'Super'])
  })
})
