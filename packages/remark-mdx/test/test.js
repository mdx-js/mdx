const unified = require('unified')
const remarkParse = require('remark-parse')
const remarkStringify = require('remark-stringify')

const remarkMdx = require('..')
const mdxAstToMdxHast = require('../../mdx/mdx-ast-to-mdx-hast')
const mdxHastToJsx = require('../../mdx/mdx-hast-to-jsx')

const FIXTURE = `
import Foo from './bar'
export { Baz } from './foo'
export default Foo

# Hello, world! <Foo bar={{ baz: 'qux' }} />

<Baz>
  Hi!
</Baz>

<Paragraph bg='red.500' color='white'>Foo</Paragraph>

<Button>
  Hi!
</Button>

<>Foo</>

<>
  Foo
</>

<h1>Hello, world!</h1>
`

// Manually apply all mdx transformations for now
// so we don't introduce a circular dependency.
//
// When remark-mdx is used by core we can remove
// these integration tests
const transpile = mdx => {
  const result = unified()
    .use(remarkParse)
    .use(remarkStringify)
    .use(remarkMdx)
    .use(mdxAstToMdxHast)
    .use(mdxHastToJsx)
    .processSync(mdx)

  return result.contents
}

const parse = mdx => {
  const result = unified()
    .use(remarkParse)
    .use(remarkStringify)
    .use(remarkMdx)
    .parse(mdx)

  return result
}

const stringify = mdx => {
  const result = unified()
    .use(remarkParse)
    .use(remarkStringify)
    .use(remarkMdx)
    .processSync(mdx)

  return result.contents
}

it('correctly transpiles', () => {
  const result = transpile(FIXTURE)

  expect(result).toMatchSnapshot()
})

it('maintains the proper positional info', () => {
  const result = parse(FIXTURE)

  expect(result).toMatchSnapshot()
})

it('does not wrap a block level elements in a paragraph', () => {
  const result = transpile(FIXTURE)

  expect(result).not.toMatch(/<p><Baz/)
  expect(result).not.toMatch(/<p><Button/)
  expect(result).not.toMatch(/<p><Paragraph>/)
  expect(result).not.toMatch(/<p><>/)
  expect(result).not.toMatch(/<p><h1/)
})

it('removes newlines between imports and exports', () => {
  const fixture = [
    'import Foo1 from "./foo"',
    'import Foo2 from "./foo"',
    'import Foo3 from "./foo"',
    'export const foo = "bar"',
    'export default props => <article {...props} />',
    'export const fred = "flintstone"'
  ].join('\n')

  const result = stringify(fixture)

  expect(result).toMatchSnapshot()
})
