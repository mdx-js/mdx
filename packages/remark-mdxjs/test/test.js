const vfile = require('vfile')
const unified = require('unified')
const remarkParse = require('remark-parse')
const remarkStringify = require('remark-stringify')
const remarkMdx = require('../../remark-mdx')
const remarkMdxjs = require('..')
const mdxAstToMdxHast = require('../../mdx/mdx-ast-to-mdx-hast')
const mdxHastToJsx = require('../../mdx/mdx-hast-to-jsx')
const extract = require('../extract-imports-and-exports')

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

const fixtures = [
  {
    description: 'Handles basic usecase of default export',
    mdx: 'export default props => <article {...props} />'
  },
  {
    description: 'Handles an import that is later exported',
    mdx: "import Layout from './Foo'\n\nexport default Layout"
  },
  {
    description: 'Separates import from the default export',
    mdx:
      "import Foo from './foo'\nexport default props => <article {...props} />"
  },
  {
    description: 'Handles const exports',
    mdx: 'export const metadata = { some: "stuff" }'
  },
  {
    description: 'Handles multiline exports',
    mdx: 'export const metadata = {\n  some: "stuff"\n}'
  },
  {
    description: 'Handles multiline default exports',
    mdx: 'export default props => (\n  <main {...props} />\n)'
  },
  {
    description: 'Handles export all',
    mdx: "export * from './foo'"
  }
]

// Manually apply all mdx transformations for now
// so we don't introduce a circular dependency.
//
// When remark-mdxjs is used by core we can remove
// these integration tests
const compiler = unified()
  .use(remarkParse)
  .use(remarkStringify)
  .use(remarkMdx)
  .use(remarkMdxjs)
  .use(mdxAstToMdxHast)
  .use(mdxHastToJsx)

it('should transpile', () => {
  const result = compiler.processSync(FIXTURE).toString()

  expect(result).toMatchSnapshot()
})

it('should maintain the proper positional info', () => {
  const result = unified()
    .use(remarkParse)
    .use(remarkStringify)
    .use(remarkMdx)
    .use(remarkMdxjs)
    .parse(FIXTURE)

  expect(result).toMatchSnapshot()
})

it('should remove newlines between imports and exports', () => {
  const fixture = [
    'import Foo1 from "./foo"',
    'import Foo2 from "./foo"',
    'import Foo3 from "./foo"',
    'export const foo = "bar"',
    'export default props => <article {...props} />',
    'export const fred = "flintstone"'
  ].join('\n')

  const result = unified()
    .use(remarkParse)
    .use(remarkStringify)
    .use(remarkMdx)
    .use(remarkMdxjs)
    .processSync(fixture)
    .toString()

  expect(result).toMatchSnapshot()
})

it('should extend the parser', () => {
  expect(
    unified().use(remarkParse).use(remarkMdxjs).parse('import a from "b"')
  ).toEqual({
    type: 'root',
    children: [
      {
        type: 'import',
        value: 'import a from "b"',
        position: {
          start: {column: 1, line: 1, offset: 0},
          end: {column: 18, line: 1, offset: 17},
          indent: []
        }
      }
    ],
    position: {
      start: {column: 1, line: 1, offset: 0},
      end: {column: 18, line: 1, offset: 17}
    }
  })
})

it('should extend the compiler', () => {
  expect(
    unified()
      .use(remarkStringify)
      .use(remarkMdxjs)
      .stringify({type: 'import', value: 'import a from "b"'})
  ).toEqual('import a from "b"')
})

fixtures.forEach(fixture => {
  it(fixture.description, () => {
    const result = extract(
      fixture.mdx,
      vfile({path: '/test', content: 'testing'})
    )

    expect(result).toMatchSnapshot()
  })
})
