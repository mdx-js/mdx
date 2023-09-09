/* @jsxRuntime automatic @jsxImportSource preact */

// * @jsx h
// * @jsxFrag Fragment
// Note: this is unused by otherwise `xo` or so seems to fail?
import assert from 'node:assert/strict'
import {test} from 'node:test'
import {h} from 'preact'
import * as runtime from 'preact/jsx-runtime'
import {render} from 'preact-render-to-string'
import {evaluate} from '@mdx-js/mdx'
import {MDXProvider, useMDXComponents, withMDXComponents} from '../index.js'

test('should support `components` with `MDXProvider`', async () => {
  const {default: Content} = await evaluate('# hi', {
    ...runtime,
    useMDXComponents
  })

  assert.equal(
    render(
      <MDXProvider
        components={{
          // @ts-expect-error: preact + react conflict.
          h1(props) {
            // @ts-expect-error: Something wrong with Preact + React maybe?
            return <h1 style={{color: 'tomato'}} {...props} />
          }
        }}
      >
        <Content />
      </MDXProvider>
    ),
    '<h1 style="color:tomato;">hi</h1>'
  )
})

test('should support `wrapper` in `components`', async () => {
  const {default: Content} = await evaluate('# hi', {
    ...runtime,
    useMDXComponents
  })

  assert.equal(
    render(
      <MDXProvider
        components={{
          // @ts-expect-error: preact + react conflict.
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
    render(
      <MDXProvider
        components={{
          // @ts-expect-error: preact + react conflict.
          h1(props) {
            // @ts-expect-error: Something wrong with Preact + React maybe?
            return <h1 style={{color: 'tomato'}} {...props} />
          },
          // @ts-expect-error: preact + react conflict.
          h2(props) {
            // @ts-expect-error: Something wrong with Preact + React maybe?
            return <h2 style={{color: 'rebeccapurple'}} {...props} />
          }
        }}
      >
        <MDXProvider
          components={{
            // @ts-expect-error: preact + react conflict.
            h2(props) {
              // @ts-expect-error: Something wrong with Preact + React maybe?
              return <h2 style={{color: 'papayawhip'}} {...props} />
            }
          }}
        >
          <Content />
        </MDXProvider>
      </MDXProvider>
    ),
    '<h1 style="color:tomato;">hi</h1>\n<h2 style="color:papayawhip;">hello</h2>'
  )
})

test('should support components as a function', async () => {
  const {default: Content} = await evaluate('# hi\n## hello', {
    ...runtime,
    useMDXComponents
  })

  assert.equal(
    render(
      <MDXProvider
        components={{
          // @ts-expect-error: preact + react conflict.
          h1(props) {
            // @ts-expect-error: Something wrong with Preact + React maybe?
            return <h1 style={{color: 'tomato'}} {...props} />
          },
          // @ts-expect-error: preact + react conflict.
          h2(props) {
            // @ts-expect-error: Something wrong with Preact + React maybe?
            return <h2 style={{color: 'rebeccapurple'}} {...props} />
          }
        }}
      >
        <MDXProvider
          // @ts-expect-error: preact + react conflict.
          components={() => ({
            h2(props) {
              // @ts-expect-error: Something wrong with Preact + React maybe?
              return <h2 style={{color: 'papayawhip'}} {...props} />
            }
          })}
        >
          <Content />
        </MDXProvider>
      </MDXProvider>
    ),
    '<h1>hi</h1>\n<h2 style="color:papayawhip;">hello</h2>'
  )
})

test('should support a `disableParentContext` prop (sandbox)', async () => {
  const {default: Content} = await evaluate('# hi', {
    ...runtime,
    useMDXComponents
  })

  assert.equal(
    render(
      <MDXProvider
        components={{
          // @ts-expect-error: preact + react conflict.
          h1(props) {
            // @ts-expect-error: Something wrong with Preact + React maybe?
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
    render(
      <MDXProvider
        components={{
          // @ts-expect-error: preact + react conflict.
          h1(props) {
            // @ts-expect-error: Something wrong with Preact + React maybe?
            return <h1 style={{color: 'tomato'}} {...props} />
          }
        }}
      >
        <MDXProvider
          disableParentContext
          // @ts-expect-error: preact + react conflict.
          components={() => ({
            h2(props) {
              // @ts-expect-error: Something wrong with Preact + React maybe?
              return <h2 style={{color: 'papayawhip'}} {...props} />
            }
          })}
        >
          <Content />
        </MDXProvider>
      </MDXProvider>
    ),
    '<h1>hi</h1>\n<h2 style="color:papayawhip;">hello</h2>'
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
    render(
      <MDXProvider
        components={{
          // @ts-expect-error: preact + react conflict.
          h1(props) {
            // @ts-expect-error: Something wrong with Preact + React maybe?
            return <h1 style={{color: 'tomato'}} {...props} />
          }
        }}
      >
        <With
          components={{
            // @ts-expect-error: preact + react conflict.
            h2(props) {
              // @ts-expect-error: Something wrong with Preact + React maybe?
              return <h2 style={{color: 'papayawhip'}} {...props} />
            }
          }}
        >
          <Content />
        </With>
      </MDXProvider>
    ),
    '<h1 style="color:tomato;">hi</h1>\n<h2>hello</h2>'
  )
})
