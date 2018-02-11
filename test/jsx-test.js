import fs from 'fs'
import path from 'path'
import test from 'ava'

import { md as markdown } from '../src'

test('it turns simple inlined jsx into a single element', t => {
  const md = `
<Foo>
  Stuff
</Foo>

## hi

<pre>
things
</pre>
`

  const result = markdown(md)

  t.snapshot(md)
})
