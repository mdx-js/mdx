const babel = require('@babel/core')

const BabelPluginApplyMdxTypeProp = require('..')

const transform = value => {
  const plugin = new BabelPluginApplyMdxTypeProp()

  const result = babel.transformSync(value, {
    configFile: false,
    plugins: [require('@babel/plugin-syntax-jsx'), plugin.plugin]
  })

  return {
    ...result,
    state: plugin.state
  }
}

describe('babel-plugin-add-mdx-type-prop', () => {
  test('should add `mdxType` to components', () => {
    expect(transform('var d = <div><Button /></div>').code).toEqual(
      'var d = <div><Button parentName="div" mdxType="Button" /></div>;'
    )
  })

  test('should support (as in, ignore) fragments', () => {
    expect(transform('var d = <><Button /></>').code).toEqual(
      'var d = <><Button mdxType="Button" /></>;'
    )
  })

  // To do: this should probably be handled
  test('should *not* support dot notation (object methods)', () => {
    expect(transform('var d = <><a.b /></>').code).toEqual(
      'var d = <><a.b /></>;'
    )
  })

  test('should track used component names in state', () => {
    expect(transform('var d = <Button />').state.names).toEqual(['Button'])
  })

  test('should track all component names', () => {
    expect(
      transform('var d = <><Button /><div /><TomatoBox /></>').state.names
    ).toEqual(['Button', 'TomatoBox'])
  })

  // To do: is this useful?
  test('should track duplicate component names', () => {
    expect(transform('var d = <><Button /><Button /></>').state.names).toEqual([
      'Button',
      'Button'
    ])
  })
})
