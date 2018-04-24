const babel = require('@babel/core')
const mdx = require('../index')
const mdxHastToJsx = require('../mdx-hast-to-jsx')
const fs = require('fs')
const path = require('path')
const { selectAll } = require('hast-util-select')
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

it('Should compile to snapshot', async () => {
  const code = await mdx('Hello World')
  expect(code).toMatchSnapshot()
})

it('Should compile sample blog post to snapshot', async () => {
  const code = await mdx(fixtureBlogPost)
  expect(code).toMatchSnapshot()
})

it('Should render blockquote correctly', () => {
  mdx
    .createMdxAstCompiler()
    .use(testResult)
    .processSync('> test\n\n> `test`')

  function testResult() {
    this.Compiler = tree => {
      const result = mdxHastToJsx.toJSX(tree.children[0])
      expect(result).toMatchSnapshot()
    }
  }
})

it('Should render HTML inside inlineCode correctly', async () => {
  const result = await mdx('`<div>`')
  expect(result.includes('<MDXTag name="inlineCode" components={components} parentName="p">{`<div>`}</MDXTag>')).toBeTruthy()
})

test('Should await and render async plugins', async () => {
  const result = await mdx(fixtureBlogPost, {
    hastPlugins: [
      () => tree => {
        const imgPx = selectAll('img', tree).map(async node => {
          const size = await requestImageSize(node.properties.src)
          node.properties.width = size.width
          node.properties.height = size.height
        })

        return Promise.all(imgPx).then(() => tree)
      }
    ]
  })

  expect(result).toMatchSnapshot()
})
