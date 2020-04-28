const fs = require('fs')
const path = require('path')
const unified = require('unified')
const parse = require('remark-parse')
const stringify = require('remark-stringify')
const mdxjs = require('remark-mdxjs')

const removeImports = require('..')

const fixture = fs.readFileSync(path.join(__dirname, './fixture.md'), 'utf8')

const serialize = mdx => {
  const result = unified()
    .use(parse)
    .use(stringify)
    .use(mdxjs)
    .use(removeImports)
    .processSync(mdx)

  return result.contents
}

it('removes imports', () => {
  const result = serialize(fixture)

  expect(result).toMatchSnapshot()
})
