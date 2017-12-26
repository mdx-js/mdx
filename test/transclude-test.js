const fs = require('fs')
const test = require('ava')
const remark = require('remark')

const markdown = require('../src/')

test('it transcludes a md file', t => {
  const md = fs.readFileSync('test/fixtures/basic.md', 'utf8')

  const result = JSON.stringify(markdown(md))

  t.regex(result, /A file to transclude/)
})
