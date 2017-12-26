const fs = require('fs')
const path = require('path')
const test = require('ava')

const markdown = require('../src')

test('it handles basic markdown with .jsx code block', t => {
  testFixture(t, 'basic')
})

test('it optionally adds a toc', t => {
  testFixture(t, 'basic', { toc: true })
})

const testFixture = (t, fixture, options) => {
  const md = fs.readFileSync(path.join('test/fixtures', `${fixture}.md`), 'utf8')
  t.snapshot(markdown(md, options))
}
