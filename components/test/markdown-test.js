import fs from 'fs'
import test from 'ava'
import React from 'react'
import { renderToString } from 'react-dom/server'

import { Markdown } from '../src'
import Foo from './fixtures/Foo'

test('renders the component as markdown', t => {
  const md = fs.readFileSync('test/fixtures/basic.md', 'utf8')

  const result = renderToString(
    <Markdown
      text={md}
      components={{
        Foo
      }}
    />
  )

  t.snapshot(result)
})
