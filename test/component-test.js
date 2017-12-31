import fs from 'fs'
import test from 'ava'
import React from 'react'
import remark from 'remark'
import { renderToString } from 'react-dom/server'

import { Markdown } from '../src'

test('renders the component as markdown', t => {
  const md = fs.readFileSync('test/fixtures/basic.md', 'utf8')

  const result = renderToString(<Markdown text={md} />)

  t.snapshot(result)
})
