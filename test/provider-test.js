import fs from 'fs'
import test from 'ava'
import React from 'react'
import remark from 'remark'
import { renderToString } from 'react-dom/server'

import {
  Markdown,
  ComponentsProvider,
  withIdLink
} from '../src'

const Heading = withIdLink(({ color = 'tomato', children, ...props }) =>
  <h1
    style={{ color }}
    children={`# ${children}`}
    {...props}
  />
)

test('renders the component as markdown', t => {
  const md = fs.readFileSync('test/fixtures/basic.md', 'utf8')

  const result = renderToString(
    <ComponentsProvider components={{ h1: Heading }}>
      <Markdown text={md} />
    </ComponentsProvider>
  )

  t.snapshot(result)
})
