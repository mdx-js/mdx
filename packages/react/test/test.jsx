import {test} from 'uvu'
import * as assert from 'uvu/assert'
import {evaluate} from '@mdx-js/mdx'
import React from 'react'
import * as runtime from 'react/jsx-runtime'
import {renderToString} from 'react-dom/server'
import {MDXProvider, useMDXComponents, withMDXComponents} from '../index.js'

test('should support `components` with `MDXProvider`', async () => {
  const {default: Content} = await evaluate('# hi', {
    ...runtime,
    useMDXComponents
  })

  assert.equal(
    renderToString(
      <MDXProvider
        components={{
          h1: (props) => <h1 style={{color: 'tomato'}} {...props} />
        }}
      >
        <Content />
      </MDXProvider>
    ),
    '<h1 style="color:tomato">hi</h1>'
  )
})

test('should support `wrapper` in `components`', async () => {
  const {default: Content} = await evaluate('# hi', {
    ...runtime,
    useMDXComponents
  })

  assert.equal(
    renderToString(
      <MDXProvider
        components={{
          wrapper: (props) => <div id="layout" {...props} />
        }}
      >
        <Content />
      </MDXProvider>
    ),
    '<div id="layout"><h1>hi</h1></div>'
  )
})

test('should combine components in nested `MDXProvider`s', async () => {
  const {default: Content} = await evaluate('# hi\n## hello', {
    ...runtime,
    useMDXComponents
  })

  assert.equal(
    renderToString(
      <MDXProvider
        components={{
          h1: (props) => <h1 style={{color: 'tomato'}} {...props} />,
          h2: (props) => <h2 style={{color: 'rebeccapurple'}} {...props} />
        }}
      >
        <MDXProvider
          components={{
            h2: (props) => <h2 style={{color: 'papayawhip'}} {...props} />
          }}
        >
          <Content />
        </MDXProvider>
      </MDXProvider>
    ),
    '<h1 style="color:tomato">hi</h1>\n<h2 style="color:papayawhip">hello</h2>'
  )
})

test('should support components as a function', async () => {
  const {default: Content} = await evaluate('# hi\n## hello', {
    ...runtime,
    useMDXComponents
  })

  assert.equal(
    renderToString(
      <MDXProvider
        components={{
          h1: (props) => <h1 style={{color: 'tomato'}} {...props} />,
          h2: (props) => <h2 style={{color: 'rebeccapurple'}} {...props} />
        }}
      >
        <MDXProvider
          components={() => ({
            h2: (props) => <h2 style={{color: 'papayawhip'}} {...props} />
          })}
        >
          <Content />
        </MDXProvider>
      </MDXProvider>
    ),
    '<h1>hi</h1>\n<h2 style="color:papayawhip">hello</h2>'
  )
})

test('should support a `disableParentContext` prop (sandbox)', async () => {
  const {default: Content} = await evaluate('# hi', {
    ...runtime,
    useMDXComponents
  })

  assert.equal(
    renderToString(
      <MDXProvider
        components={{
          h1: (props) => <h1 style={{color: 'tomato'}} {...props} />
        }}
      >
        <MDXProvider disableParentContext>
          <Content />
        </MDXProvider>
      </MDXProvider>
    ),
    '<h1>hi</h1>'
  )
})

test('should support `withComponents`', async () => {
  const {default: Content} = await evaluate('# hi\n## hello', {
    ...runtime,
    useMDXComponents
  })
  const With = withMDXComponents((props) => props.children)

  // Bug: this should use the `h2` component too, logically?
  // As `withMDXComponents` is deprecated, and it would probably be a breaking
  // change, we can just remove it later.
  assert.equal(
    renderToString(
      <MDXProvider
        components={{
          h1: (props) => <h1 style={{color: 'tomato'}} {...props} />
        }}
      >
        <With
          components={{
            h2: (props) => <h2 style={{color: 'papayawhip'}} {...props} />
          }}
        >
          <Content />
        </With>
      </MDXProvider>
    ),
    '<h1 style="color:tomato">hi</h1>\n<h2>hello</h2>'
  )
})

test.run()
