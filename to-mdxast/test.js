const fs = require('fs')
const test = require('ava')
const unified = require('unified')
const remark = require('remark-parse')
const rehype = require('remark-rehype')
const matter = require('remark-frontmatter')
const html = require('rehype-stringify')
const blocks = require('remark-parse/lib/block-elements.json')

const toMdx = require('./')
const getImports = require('./get-imports')

const fixture = fs.readFileSync('fixture.md', 'utf8')

const parseFixture = str => {
  const imports = getImports(str)

  const options = {
    blocks: blocks.concat(imports.scope),
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

test('it parses a file', t => {
  const result = parseFixture(fixture)

  t.snapshot(result)
})

test('it retrieves imports', t => {
  const result = getImports(fixture)

  t.snapshot(result)
})
