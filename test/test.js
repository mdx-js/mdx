import fs from 'fs'
import path from 'path'
import test from 'ava'

import { md as markdown } from '../src'

test('it handles basic markdown with .jsx code block', t => {
  testFixture(t, 'basic')
})

test('it optionally adds a toc', t => {
  testFixture(t, 'basic', { toc: true })
})

test('default props are applied to components', t => {
  testFixture(t, 'basic', {
    props: {
      h1: {
        color: 'tomato'
      }
    }
  })
})

const testFixture = (t, fixture, options) => {
  const md = fs.readFileSync(path.join('test/fixtures', `${fixture}.md`), 'utf8')
  t.snapshot(markdown(md, options))
}
