import fs from 'fs'
import path from 'path'
import test from 'ava'

import { md as markdown } from '../src'

test('it outputs html when skipReact is passed', t => {
  const md = fs.readFileSync('test/fixtures/basic.md', 'utf8')
  t.snapshot(markdown(md, { skipReact: true }))
})
