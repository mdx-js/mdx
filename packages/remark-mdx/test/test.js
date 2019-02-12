const unified = require('unified')
const remarkParse = require('remark-parse')
const remarkMDX = require('..')
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
    .use(remarkMDX)
    .use(mdxAstToMdxHast)
    .use(mdxHastToJsx)
    .processSync(mdx)

  return result.contents
}

it('correctly transpiles', () => {
  const result = transpile(FIXTURE)

  expect(result).toMatchSnapshot()
})
