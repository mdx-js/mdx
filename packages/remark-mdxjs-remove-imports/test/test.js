const fs = require('fs')
const path = require('path')
const unified = require('unified')
const remarkParse = require('remark-parse')
const remarkStringify = require('remark-stringify')
const remarkMdx = require('remark-mdx')

const removeImports = require('..')

const fixture = fs.readFileSync(path.join(__dirname, './fixture.md'), 'utf8')

const stringify = mdx => {
  const result = unified()
    .use(remarkParse)
    .use(remarkStringify)
    .use(remarkMdx)
    .use(removeImports)
    .processSync(mdx)

  return result.contents
}

it('removes imports', () => {
  const result = stringify(fixture)

  expect(result).toMatchSnapshot()
})
