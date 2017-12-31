import fs from 'fs'
import path from 'path'
import test from 'ava'

import { md as markdown } from '../src'

test('it transcludes an md file', t => {
  const md = fs.readFileSync('test/fixtures/basic.md', 'utf8')

  const result = JSON.stringify(markdown(md))

  t.regex(result, /A file to transclude/)
})

test('it does not transclude a file when transclude: false is passed', t => {
  const md = fs.readFileSync('test/fixtures/basic.md', 'utf8')

  const result = JSON.stringify(markdown(md, { transclude: false }))

  t.notRegex(result, /A file to transclude/)
})
