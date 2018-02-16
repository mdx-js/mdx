const fs = require('fs')
const test = require('ava')

const mdx = require('./')

const fixture = fs.readFileSync('fixture.md', 'utf8')

test('it parses and renders to react', t => {
  const result = mdx(fixture, {})

  t.snapshot(result)
})
