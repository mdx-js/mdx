const fs = require('fs')
const test = require('ava')
const parse = require('./')

const fixture = fs.readFileSync('fixture.md', 'utf8')

test('it formats an unformatted file', t => {
  const result = parse(fixture)

  console.log(JSON.stringify(result, null, 2))

  t.snapshot(result)
})
