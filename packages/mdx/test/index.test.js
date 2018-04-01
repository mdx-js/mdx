const mdx = require('../index')
const babel = require('@babel/core')

it('Should output parseable javascript (jsx)', () => {
  const code = mdx('Hello World')
  babel.parse(code, {
    plugins: ["@babel/plugin-syntax-jsx"]
  })
})

it('Should output an MDXTag with type="p"', () => {
  const code = mdx('Hello World')
  expect(code).toMatchSnapshot()  
})
