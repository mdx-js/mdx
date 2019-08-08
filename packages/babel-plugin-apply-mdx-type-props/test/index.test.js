const babel = require('@babel/core')

const BabelPluginApplyMdxTypeProp = require('..')

const FIXTURE = `export const Foo = () => <div>
  <Button />
</div>;
export default (() => <>
  <h1>Hello!</h1>
  <TomatoBox />
</>);
`

const EXPECTED = `export const Foo = () => <div>
  <Button mdxType="Button" />
</div>;
export default (() => <>
  <h1>Hello!</h1>
  <TomatoBox mdxType="TomatoBox" />
</>);`

const transform = str => {
  const plugin = new BabelPluginApplyMdxTypeProp()

  const result = babel.transform(str, {
    configFile: false,
    plugins: [require('@babel/plugin-syntax-jsx'), plugin.plugin]
  })

  return {
    ...result,
    state: plugin.state
  }
}

describe('babel-plugin-add-mdx-type-prop', () => {
  test('adds mdxType to custom components', () => {
    const result = transform(FIXTURE)

    expect(result.code).toEqual(EXPECTED)
  })

  test('adds component names to state', () => {
    const result = transform(FIXTURE)

    expect(result.state.names).toEqual(['Button', 'TomatoBox'])
  })
})
