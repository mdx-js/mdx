const fs = require('fs')
const unified = require('unified')
const remark = require('remark-parse')
const rehype = require('remark-rehype')
const html = require('rehype-stringify')

const toMdx = require('..')

const fixture = fs.readFileSync('test/fixture.md', 'utf8')

const parseFixture = str => {
  const parser = unified()
    .use(remark)
    .use(toMdx)
    .use(rehype)
    .use(html)

  return parser.processSync(str).contents
}

test('it parses a file', () => {
  parseFixture(fixture)
})
