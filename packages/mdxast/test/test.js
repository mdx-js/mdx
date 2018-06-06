const fs = require('fs')
const unified = require('unified')
const remark = require('remark-parse')
const rehype = require('remark-rehype')
const matter = require('remark-frontmatter')
const html = require('rehype-stringify')
const blocks = require('remark-parse/lib/block-elements.json')

const toMdx = require('..')

const fixture = fs.readFileSync('test/fixture.md', 'utf8')

const parseFixture = str => {
  const options = {
    blocks: blocks,
    matter: {
      type: 'yaml',
      marker: '-'
    }
  }

  const parser = unified()
    .use(remark, options)
    .use(matter, options.matter)
    .use(toMdx, options)
    .use(rehype)
    .use(html)

  return parser.processSync(str).contents
}

test('it parses a file', () => {
  parseFixture(fixture)
})
