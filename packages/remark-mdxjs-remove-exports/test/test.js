const fs = require('fs')
const path = require('path')
const unified = require('unified')
const parse = require('remark-parse')
const stringify = require('remark-stringify')
const mdxjs = require('remark-mdxjs')

const removeExports = require('..')

const fixture = fs.readFileSync(path.join(__dirname, './fixture.md'), 'utf8')

const serialize = mdx => {
  const result = unified()
    .use(parse)
    .use(stringify)
    .use(mdxjs)
    .use(removeExports)
    .processSync(mdx)

  return result.contents
}

it('removes exports', () => {
  const result = serialize(fixture)

  expect(result).toMatchSnapshot()
})
