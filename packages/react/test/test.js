import React from 'react'
import {renderToString} from 'react-dom/server'

import {MDXProvider} from '../src/context'
import Fixture from './fixture'
import SandboxFixture from './sandbox-fixture'

const H1 = props => <h1 style={{color: 'tomato'}} {...props} />
const H2 = props => <h2 style={{color: 'rebeccapurple'}} {...props} />
const CustomH2 = props => <h2 style={{color: 'papayawhip'}} {...props} />
const CustomDelete = props => <del style={{color: 'crimson'}} {...props} />
const Layout = ({children}) => <div id="layout">{children}</div>

it('allows components to be passed via context', () => {
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

it('merges components when there is nested context', () => {
  const components = {h1: H1, h2: H2}

  const result = renderToString(
    <MDXProvider components={components}>
      <MDXProvider components={{h2: CustomH2}}>
        <Fixture />
      </MDXProvider>
    </MDXProvider>
  )

  // MDX pragma picks up original component context
  expect(result).toMatch(/style="color:tomato"/)

  // MDX pragma picks up overridden component context
  expect(result).toMatch(/style="color:papayawhip"/)
})

it('allows removing of context components using the functional form', () => {
  const components = {h1: H1, h2: H2}

  const result = renderToString(
    <MDXProvider components={components}>
      <MDXProvider components={_outerComponents => ({h2: CustomH2})}>
        <Fixture />
      </MDXProvider>
    </MDXProvider>
  )

  // MDX pragma does not pick up original component context
  expect(result).not.toMatch(/style="color:tomato"/)

  // MDX pragma picks up overridden component context
  expect(result).toMatch(/style="color:papayawhip"/)
})

it('allows removing of context components when disableParentContext is set to false', () => {
  const components = {h1: H1}

  const result = renderToString(
    <MDXProvider components={components}>
      <MDXProvider disableParentContext={true}>
        <Fixture />
      </MDXProvider>
    </MDXProvider>
  )

  // MDX pragma does not pick up original component context
  expect(result).not.toMatch(/style="color:tomato"/)
})

it('allows removing of context components from a composed component', () => {
  const components = {h1: H1}

  const result = renderToString(
    <MDXProvider components={components}>
      <SandboxFixture />
    </MDXProvider>
  )

  // MDX pragma does not pick up original component context
  expect(result).not.toMatch(/tomato/)
})

it('passes prop components along', () => {
  const result = renderToString(<Fixture />)

  expect(result).toMatch(/h3, h4/)
})

it('renders custom del', () => {
  const result = renderToString(
    <MDXProvider components={{del: CustomDelete}}>
      <Fixture />
    </MDXProvider>
  )

  expect(result).toMatch(/style="color:crimson"/)
})
