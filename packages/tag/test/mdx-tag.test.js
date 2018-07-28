import fs from 'fs'
import React from 'react'
import { renderToString } from 'react-dom/server'

import { MDXTag } from '../src'

const H1 = props => <h1 style={{ color: 'tomato' }} {...props} />

it('Should render the desired component', async () => {
  const result = renderToString(
    <MDXTag name="h1" components={{ h1: H1 }} children="Hello, world!" />
  )

  expect(result).toMatch(/style="color:tomato"/)
})

it('Should render the layout component', async () => {
  const Layout = ({ children, id }) => <div id={id}>{children}</div>
  const components = { h1: H1 }
  const result = renderToString(
    <MDXTag
      Layout={Layout}
      name="wrapper"
      components={components}
      layoutProps={{ id: 'layout' }}
    >
      <MDXTag name="h1" components={{ h1: H1 }} />
    </MDXTag>
  )

  // Layout is rendered
  expect(result).toMatch(/id="layout"/)

  // MDXTags can be nested inside the layout
  expect(result).toMatch(/style="color:tomato"/)
})
