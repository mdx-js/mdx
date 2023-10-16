/**
 * @typedef {import('@mdx-js/mdx/lib/util/resolve-evaluate-options.js').RuntimeProduction} RuntimeProduction
 */

import assert from 'node:assert/strict'
import {test} from 'node:test'
import {evaluate} from '@mdx-js/mdx'
import React from 'react'
import * as runtime_ from 'react/jsx-runtime'
import {renderToString} from 'react-dom/server'
import {MDXProvider, useMDXComponents, withMDXComponents} from '../index.js'

const runtime = /** @type {RuntimeProduction} */ (
  /** @type {unknown} */ (runtime_)
)

test('should support `components` with `MDXProvider`', async () => {
  const {default: Content} = await evaluate('# hi', {
    ...runtime,
    useMDXComponents
  })

  assert.equal(
    renderToString(
      <MDXProvider
        components={{
          h1(props) {
            return <h1 style={{color: 'tomato'}} {...props} />
          }
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
          wrapper(/** @type {Record<string, unknown>} */ props) {
            return <div id="layout" {...props} />
          }
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
          h1(props) {
            return <h1 style={{color: 'tomato'}} {...props} />
          },
          h2(props) {
            return <h2 style={{color: 'rebeccapurple'}} {...props} />
          }
        }}
      >
        <MDXProvider
          components={{
            h2(props) {
              return <h2 style={{color: 'papayawhip'}} {...props} />
            }
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
          h1(props) {
            return <h1 style={{color: 'tomato'}} {...props} />
          },
          h2(props) {
            return <h2 style={{color: 'rebeccapurple'}} {...props} />
          }
        }}
      >
        <MDXProvider
          components={() => ({
            h2(props) {
              return <h2 style={{color: 'papayawhip'}} {...props} />
            }
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
          h1(props) {
            return <h1 style={{color: 'tomato'}} {...props} />
          }
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

test('should support a `disableParentContext` *and* `components as a function', async () => {
  const {default: Content} = await evaluate('# hi\n## hello', {
    ...runtime,
    useMDXComponents
  })

  assert.equal(
    renderToString(
      <MDXProvider
        components={{
          h1(props) {
            return <h1 style={{color: 'tomato'}} {...props} />
          }
        }}
      >
        <MDXProvider
          disableParentContext
          components={() => ({
            h2(props) {
              return <h2 style={{color: 'papayawhip'}} {...props} />
            }
          })}
        >
          <Content />
        </MDXProvider>
      </MDXProvider>
    ),
    '<h1>hi</h1>\n<h2 style="color:papayawhip">hello</h2>'
  )
})

test('should support `withComponents`', async () => {
  const {default: Content} = await evaluate('# hi\n## hello', {
    ...runtime,
    useMDXComponents
  })
  // Unknown props.
  // type-coverage:ignore-next-line
  const With = withMDXComponents((props) => props.children)

  // Bug: this should use the `h2` component too, logically?
  // As `withMDXComponents` is deprecated, and it would probably be a breaking
  // change, we can just remove it later.
  assert.equal(
    renderToString(
      <MDXProvider
        components={{
          h1(props) {
            return <h1 style={{color: 'tomato'}} {...props} />
          }
        }}
      >
        <With
          components={{
            h2(props) {
              return <h2 style={{color: 'papayawhip'}} {...props} />
            }
          }}
        >
          <Content />
        </With>
      </MDXProvider>
    ),
    '<h1 style="color:tomato">hi</h1>\n<h2>hello</h2>'
  )
})
