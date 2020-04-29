const fs = require('fs')
const path = require('path')
const unified = require('unified')
const parse = require('remark-parse')
const stringify = require('remark-stringify')
const mdx = require('remark-mdx')
const mdxjs = require('remark-mdxjs')

const removeExports = require('..')

const fixture = fs.readFileSync(path.join(__dirname, './fixture.md'), 'utf8')

const serialize = doc => {
  const result = unified()
    .use(parse)
    .use(stringify)
    .use(mdx)
    .use(mdxjs)
    .use(removeExports)
    .processSync(doc)

  return result.contents
}

it('removes exports', () => {
  const result = serialize(fixture)

  expect(result).toMatchSnapshot()
})
