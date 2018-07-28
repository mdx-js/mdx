import fs from 'fs'
import React from 'react'
import { renderToString } from 'react-dom/server'

import { MDXTag, MDXProvider } from '../src'

const H1 = props => <h1 style={{ color: 'tomato' }} {...props} />

it('Should allow components to be passed via context', async () => {
  const Layout = ({ children }) => <div id="layout">{children}</div>
  const components = { h1: H1 }
  const result = renderToString(
    <MDXProvider components={components}>
      <MDXTag Layout={Layout} name="wrapper">
        <MDXTag name="h1" />
      </MDXTag>
    </MDXProvider>
  )

  // Layout is rendered
  expect(result).toMatch(/id="layout"/)

  // MDXTag picks up on component context
  expect(result).toMatch(/style="color:tomato"/)
})

it('Should allow context components to be overridden', async () => {
  const Layout = ({ children }) => <div id="layout">{children}</div>
  const components = { h1: H1 }
  const result = renderToString(
    <MDXProvider components={{}}>
      <MDXTag name="h1" components={components} />
    </MDXProvider>
  )

  // MDXTag is passed overriding components
  expect(result).toMatch(/style="color:tomato"/)
})
