import fs from 'fs'
import test from 'ava'
import React from 'react'
import { renderToString } from 'react-dom/server'

import { MDXTag } from '../src'

const H1 = props => <h1 style={{ color: 'tomato' }} {...props} />

test('renders the desired component', t => {
  const result = renderToString(
    <MDXTag
      name='h1'
      components={{ h1: H1 }}
      children='Hello, world!'
    />
  )

  t.snapshot(result)
})
