const babel = require('@babel/core')

const plugin = require('..')

const testContents = `
<img srcset="foo" />
`
const expectedResults = `/*#__PURE__*/
React.createElement("img", {
  srcSet: "foo"
});`

describe('babel-plugin-remove-export-keywords', () => {
  test('removes all export keywords', () => {
    const result = babel.transform(testContents, {
      configFile: false,
      plugins: [plugin],
      presets: [require('@babel/preset-react')]
    })

    expect(result.code).toEqual(expectedResults)
  })
})
