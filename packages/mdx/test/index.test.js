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

const parse = code =>
  babel.parse(code, {
    plugins: [
      '@babel/plugin-syntax-jsx',
      '@babel/plugin-proposal-object-rest-spread'
    ]
  })

it('Should output parseable JSX', async () => {
  const result = await mdx('Hello World')

  parse(result)
})

it('Should output parseable JSX when using < or >', async () => {
  const result = await mdx(`
  # Hello, MDX

  I <3 Markdown and JSX
  `)

  parse(result)
})

it('Should compile sample blog post', async () => {
  const result = await mdx(fixtureBlogPost)

  parse(result)
})

it('Should render blockquote correctly', async () => {
  const result = await mdx('> test\n\n> `test`')

  parse(result)
})

it('Should render HTML inside inlineCode correctly', async () => {
  const result = await mdx('`<div>`')

  expect(
    result.includes(
      '<MDXTag name="inlineCode" components={components} parentName="p">{`<div>`}</MDXTag>'
    )
  ).toBeTruthy()
})

it('Should support comments', async () => {
  const result = await mdx(`
A paragraph
<!-- a Markdown comment -->
\`\`\`md
<!-- a code block Markdown comment -->
\`\`\`
<div>
  {/* a nested JSX comment */}
  <!-- a nested Markdown comment -->
</div>
  `)
  expect(result.includes('{/* a Markdown comment */}')).toBeTruthy()
  expect(result.includes('<!-- a code block Markdown comment -->')).toBeTruthy()
  expect(result.includes('{/* a nested JSX comment */}')).toBeTruthy()
  expect(result.includes('{/* a nested Markdown comment */}')).toBeTruthy()
})

it('Should recognize components as properties', async () => {
  const result = await mdx('# Hello\n\n<MDX.Foo />')
  expect(
    result.includes(
      '<MDXTag name="h1" components={components}>{`Hello`}</MDXTag>\n<MDX.Foo />'
    )
  ).toBeTruthy()
})

it('Should render elements without wrapping blank new lines', async () => {
  const result = await mdx(`
  | Test | Table |
  | :--- | :---- |
  | Col1 | Col2  |`)

  expect(result.includes('{`\n`}')).toBe(false)
})

test('Should await and render async plugins', async () => {
  const result = await mdx(fixtureBlogPost, {
    hastPlugins: [
      options => tree => {
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

test(
  'Should parse and render footnotes',
  async () => {
    const result = await mdx(
      'This is a paragraph with a [^footnote]\n\n[^footnote]: Here is the footnote'
    )

    expect(
      result.includes(
        '<MDXTag name="sup" components={components} parentName="p" props={{"id":"fnref-footnote"}}>'
      )
    )

    expect(
      result.includes(
        '<MDXTag name="li" components={components} parentName="ol" props={{"id":"fn-footnote"}}>'
      )
    )
  },
  10000
)

test('Should expose a sync compiler', async () => {
  const result = mdx.sync(fixtureBlogPost)

  expect(result).toMatch(/Hello, world!/)
})
