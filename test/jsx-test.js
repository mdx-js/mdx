import fs from 'fs'
import path from 'path'
import test from 'ava'

import { md as markdown } from '../src'
import Foo from './fixtures/Foo'

test('it turns simple inlined jsx into a single element', t => {
  const md = `
# Hello world!

<Foo>Stuff</Foo>
`

  const result = markdown(md, {
    components: Foo
  })

  t.snapshot(md)
})
