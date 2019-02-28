const unified = require('unified')
const remarkParse = require('remark-parse')
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

it('correctly transpiles', () => {
  const result = transpile(FIXTURE)

  expect(result).toMatchSnapshot()
})

it('maintains the proper positional info', () => {
  const result = parse(FIXTURE)

  expect(result).toMatchSnapshot()
})
