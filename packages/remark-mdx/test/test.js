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
`

// Manually apply all mdx transformations for now
// so we don't introduce a circular dependency.
//
// When remark-mdx is used by core we can remove
// these integration tests
const transpile = mdx => {
  const result = unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(mdxAstToMdxHast)
    .use(mdxHastToJsx)
    .processSync(mdx)

  return result.contents
}

const parse = mdx => {
  const result = unified()
    .use(remarkParse)
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
