import {parse} from '@babel/core'
import mdx from '@mdx-js/mdx'
import fs from 'fs'
import path from 'path'
import {select} from 'hast-util-select'
import {VueJSXCompiler} from '../src/mdx-hast-to-vue-jsx'

const fixtureBlogPost = fs.readFileSync(
  path.join(__dirname, './fixtures/blog-post.md')
)

const parseCode = code =>
  parse(code, {
    plugins: ['transform-vue-jsx']
  })

const mdxWithVueCompiler = (md, options = {}) =>
  mdx(md, {
    ...options,
    ...{compilers: [VueJSXCompiler]}
  })

it('Should output parsable JSX with Vue', async () => {
  const result = await mdxWithVueCompiler('Hello World')
  parseCode(result)
})

it('Should output parseable JSX when using < or >', async () => {
  const result = await mdxWithVueCompiler(`
  # Hello, MDX

  I <3 Markdown and JSX
  `)
  parseCode(result)
})

it('Should compile sample blog post', async () => {
  const result = await mdxWithVueCompiler(fixtureBlogPost)
  parseCode(result)
})

it('Should render blockquote correctly', async () => {
  const result = await mdxWithVueCompiler('> test\n\n> `test`')
  parseCode(result)
})

it('Should render HTML inside inlineCode correctly', async () => {
  const result = await mdxWithVueCompiler('`<div>`')
  expect(
    result.includes(
      '<MDXTag name="inlineCode" components={this.components} parentName="p">{`<div>`}</MDXTag>'
    )
  ).toBeTruthy()
})

it.skip('Should support comments', async () => {
  const result = await mdxWithVueCompiler(`
A paragraph

\`\`\`md
<!-- a code block Markdown comment -->
\`\`\`

<div>
  {/* a nested JSX comment */}
  <!-- a nested Markdown comment -->
</div>
  `)

  expect(result.includes('<!-- a code block Markdown comment -->')).toBeTruthy()
  expect(result.includes('{/* a nested JSX comment */}')).toBeTruthy()
  expect(result.includes('{/* a nested Markdown comment */}')).toBeTruthy()
})

it('Should not include export wrapper if skipExport is true', async () => {
  const result = await mdxWithVueCompiler('> test\n\n> `test`', {
    skipExport: true
  })

  expect(
    result.includes(`
      export default {
        render() {
      `)
  ).toBeFalsy()
})

it('Should recognize components as properties', async () => {
  const result = await mdxWithVueCompiler('# Hello\n\n<MDX.Foo />')
  expect(
    result.includes(
      '<MDXTag name="h1" components={this.components}>{`Hello`}</MDXTag>\n<MDX.Foo />'
    )
  ).toBeTruthy()
})

it('Should render elements without wrapping blank new lines', async () => {
  const result = await mdxWithVueCompiler(`
  | Test | Table |
  | :--- | :---- |
  | Col1 | Col2  |`)

  expect(result.includes('{`\n`}')).toBe(false)
})

it('Should await and render async plugins', async () => {
  const result = await mdxWithVueCompiler(fixtureBlogPost, {
    hastPlugins: [
      () => tree => {
        return (() => {
          const headingNode = select('h1', tree)
          const textNode = headingNode.children[0]
          textNode.value = textNode.value.toUpperCase()
        })()
      }
    ]
  })

  expect(result).toMatch(/HELLO, WORLD!/)
})

it('Should parse and render footnotes', async () => {
  const result = await mdxWithVueCompiler(
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
}, 10000)
