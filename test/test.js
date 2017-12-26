const fs = require('fs')
const path = require('path')
const test = require('ava')

const markdown = require('../src')

test('it handles basic markdown with .jsx code block', t => {
  testFixture(t, 'basic')
})

const testFixture = (t, fixture) => {
  const md = fs.readFileSync(path.join('test/fixtures', `${fixture}.md`), 'utf8')
  t.snapshot(markdown(md))
}
