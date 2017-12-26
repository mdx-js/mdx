const fs = require('fs')
const test = require('ava')
const remark = require('remark')

const transclude = require('../src/lib/transclude')

test('it transcludes a md file', t => {
  const md = fs.readFileSync('test/fixtures/basic.md', 'utf8')

  const result = remark().use(transclude).processSync(md)

  t.snapshot(result)
})
