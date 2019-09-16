const babel = require('@babel/core')

const plugin = require('..')

const testContents = `
<img
  srcset="foo"
  ariaHidden="hidden"
  className={["foo", "bar"]}
/>
`
const expectedResults = `React.createElement("img", {
  srcSet: "foo",
  "aria-hidden": "hidden",
  className: "foo bar"
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
