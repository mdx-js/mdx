const babel = require('@babel/core')
const mdx = require('../index')
const mdxHastToJsx = require('../mdx-hast-to-jsx')
const fs = require('fs')
const path = require('path')
const { select } = require('hast-util-select')
const requestImageSize = require('request-image-size')

const fixtureBlogPost = fs.readFileSync(
  path.join(__dirname, './fixtures/blog-post.md')
)

it('Should output parseable JSX', async () => {
  const code = await mdx('Hello World')
  babel.parse(code, {
    plugins: ['@babel/plugin-syntax-jsx']
  })
})

it('Should output parseable JSX when using < or >', async () => {
  const code = await mdx(`
  # Hello, MDX
    
  I <3 Markdown and JSX
  `)
  babel.parse(code, {
    plugins: ['@babel/plugin-syntax-jsx']
  })
})

it('Should compile sample blog post', async () => {
  const code = await mdx(fixtureBlogPost)
  babel.parse(code, {
    plugins: ['@babel/plugin-syntax-jsx']
  })
})

it('Should render blockquote correctly', async () => {
  const code = await mdx('> test\n\n> `test`')
  babel.parse(code, {
    plugins: ['@babel/plugin-syntax-jsx']
  })
})

it('Should render HTML inside inlineCode correctly', async () => {
  const result = await mdx('`<div>`')
  expect(
    result.includes(
      '<MDXTag name="inlineCode" components={components} parentName="p">{`<div>`}</MDXTag>'
    )
  ).toBeTruthy()
})

test('Should await and render async plugins', async () => {
  const result = await mdx(fixtureBlogPost, {
    hastPlugins: [
      (options) => tree => {        
        // Returning a promise here will suffice for the test
        return (async () => {
          const headingNode = select('h1', tree)
          const textNode = headingNode.children[0]
          textNode.value = textNode.value.toUpperCase()
        })()
      }
    ]
  })

  expect(result).toMatch(/HELLO, WORLD!/)
})

test('Should expose a sync compiler', async () => {
  const result = mdx.sync(fixtureBlogPost)

  expect(result).toMatch(/Hello, world!/)
})
