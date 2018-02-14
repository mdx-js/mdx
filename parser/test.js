const fs = require('fs')
const test = require('ava')
const parse = require('./')

const fixture = fs.readFileSync('fixture.md', 'utf8')

test('it parses a file', t => {
  const result = parse(fixture)

  //console.log(JSON.stringify(result, null, 2))

  t.snapshot(result)
})

test('it raises an error on invalid jsx', t => {
  const error = t.throws(() => parse('</Foo>'))

  t.regex(error.message, /Foo/)
})
