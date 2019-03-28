import React from 'react'
import {renderToString} from 'react-dom/server'

import {MDXProvider} from '../src/context'
import Fixture from './fixture'

const H1 = props => <h1 style={{color: 'tomato'}} {...props} />
const H2 = props => <h2 style={{color: 'rebeccapurple'}} {...props} />
const CustomH2 = props => <h2 style={{color: 'papayawhip'}} {...props} />

it('Should allow components to be passed via context', () => {
  const Layout = ({children}) => <div id="layout">{children}</div>

  const result = renderToString(
    <MDXProvider components={{h1: H1, wrapper: Layout}}>
      <Fixture />
    </MDXProvider>
  )

  // Layout is rendered
  expect(result).toMatch(/id="layout"/)

  // H1 is rendered
  expect(result).toMatch(/style="color:tomato"/)
})

it('Should merge components when there is nested context', () => {
  const components = {h1: H1, h2: H2}

  const result = renderToString(
    <MDXProvider components={components}>
      <MDXProvider components={{h2: CustomH2}}>
        <Fixture />
      </MDXProvider>
    </MDXProvider>
  )

  // MDXTag picks up original component context
  expect(result).toMatch(/style="color:tomato"/)

  // MDXTag picks up overridden component context
  expect(result).toMatch(/style="color:papayawhip"/)
})

it('Should allow removing of context components using the functional form', () => {
  const components = {h1: H1, h2: H2}

  const result = renderToString(
    <MDXProvider components={components}>
      <MDXProvider components={_outerComponents => ({h2: CustomH2})}>
        <Fixture />
      </MDXProvider>
    </MDXProvider>
  )

  // MDXTag does not pick up original component context
  expect(result).not.toMatch(/style="color:tomato"/)

  // MDXTag picks up overridden component context
  expect(result).toMatch(/style="color:papayawhip"/)
})
