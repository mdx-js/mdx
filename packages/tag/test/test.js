import fs from 'fs'
import test from 'ava'
import React from 'react'
import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import vm from 'vm'
import * as babel from 'babel-core'

import mdx from '../../mdx'
import { MDXTag } from '../src'

const H1 = props => <h1 style={{ color: 'tomato' }} {...props} />

test('renders the desired component', t => {
  const result = renderToString(
    <MDXTag name="h1" components={{ h1: H1 }} children="Hello, world!" />
  )

  t.snapshot(result)
})

test('renders the desired component (wrapper)', t => {
  const jsx = mdx.sync('# Hello')
  const { code } = babel.transform(jsx, {
    presets: ['react']
  })
  const Markdown = vm.runInContext(
    code.replace(/export default/, ''),
    vm.createContext({ React, MDXTag })
  )
  const html = renderToStaticMarkup(
    <Markdown components={{ wrapper: React.Fragment }} />
  )
  t.is(html, '<h1>Hello</h1>')
})