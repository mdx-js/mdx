import React from 'react'
import {renderToString} from 'react-dom/server'

import {MDXTag, MDXProvider} from '../src'

const H1 = props => <h1 style={{color: 'tomato'}} {...props} />
const H2 = props => <h2 style={{color: 'rebeccapurple'}} {...props} />
const CustomH2 = props => <h2 style={{color: 'papayawhip'}} {...props} />

it('Should allow components to be passed via context', () => {
  const Layout = ({children}) => <div id="layout">{children}</div>
  const components = {h1: H1}
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

it('Should allow context components to be overridden', () => {
  const components = {h1: H1}
  const result = renderToString(
    <MDXProvider components={{}}>
      <MDXTag name="h1" components={components} />
    </MDXProvider>
  )

  // MDXTag is passed overriding components
  expect(result).toMatch(/style="color:tomato"/)
})

it('Should merge components when there is nested context', () => {
  const components = {h1: H1, h2: H2}

  const result = renderToString(
    <MDXProvider components={components}>
      <MDXProvider components={components => ({...components, h2: CustomH2})}>
        <MDXTag name="h1" />
        <MDXTag name="h2" />
      </MDXProvider>
    </MDXProvider>
  )

  // MDXTag picks up original component context
  expect(result).toMatch(/style="color:tomato"/)

  // MDXTag picks up overridden component context
  expect(result).toMatch(/style="color:papayawhip"/)
})
