import fs from 'fs'
import test from 'ava'
import React from 'react'
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
  const result = renderToString(
    <ComponentsProvider components={{ h1: Heading }}>
      <Markdown text='# Hello, world!' />
    </ComponentsProvider>
  )

  t.snapshot(result)
})
