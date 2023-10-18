/* @jsxRuntime automatic @jsxImportSource preact */

/**
 * @typedef {import('@mdx-js/mdx/internal-resolve-evaluate-options').RuntimeProduction} RuntimeProduction
 */

import assert from 'node:assert/strict'
import {test} from 'node:test'
import {evaluate} from '@mdx-js/mdx'
import {MDXProvider, useMDXComponents} from '@mdx-js/preact'
import * as runtime_ from 'preact/jsx-runtime'
import {render} from 'preact-render-to-string'

const runtime = /** @type {RuntimeProduction} */ (runtime_)

test('@mdx-js/preact', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(Object.keys(await import('@mdx-js/preact')).sort(), [
      'MDXProvider',
      'useMDXComponents'
    ])
  })

  await t.test(
    'should support `components` with `MDXProvider`',
    async function () {
      const {default: Content} = await evaluate('# hi', {
        ...runtime,
        useMDXComponents
      })

      assert.equal(
        render(
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
        '<h1 style="color:tomato;">hi</h1>'
      )
    }
  )

  await t.test('should support `wrapper` in `components`', async function () {
    const {default: Content} = await evaluate('# hi', {
      ...runtime,
      useMDXComponents
    })

    assert.equal(
      render(
        <MDXProvider
          components={{
            /**
             * @param {JSX.IntrinsicElements['div']} props
             *   Props.
             * @returns
             *   Element.
             */
            wrapper(props) {
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

  await t.test(
    'should combine components in nested `MDXProvider`s',
    async function () {
      const {default: Content} = await evaluate('# hi\n## hello', {
        ...runtime,
        useMDXComponents
      })

      assert.equal(
        render(
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
        '<h1 style="color:tomato;">hi</h1>\n<h2 style="color:papayawhip;">hello</h2>'
      )
    }
  )

  await t.test('should support components as a function', async function () {
    const {default: Content} = await evaluate('# hi\n## hello', {
      ...runtime,
      useMDXComponents
    })

    assert.equal(
      render(
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
            components={function () {
              return {
                h2(props) {
                  return <h2 style={{color: 'papayawhip'}} {...props} />
                }
              }
            }}
          >
            <Content />
          </MDXProvider>
        </MDXProvider>
      ),
      '<h1>hi</h1>\n<h2 style="color:papayawhip;">hello</h2>'
    )
  })

  await t.test(
    'should support a `disableParentContext` prop (sandbox)',
    async function () {
      const {default: Content} = await evaluate('# hi', {
        ...runtime,
        useMDXComponents
      })

      assert.equal(
        render(
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
    }
  )

  await t.test(
    'should support a `disableParentContext` *and* `components` as a function',
    async function () {
      const {default: Content} = await evaluate('# hi\n## hello', {
        ...runtime,
        useMDXComponents
      })

      assert.equal(
        render(
          <MDXProvider
            components={{
              h1(props) {
                return <h1 style={{color: 'tomato'}} {...props} />
              }
            }}
          >
            <MDXProvider
              disableParentContext
              components={function () {
                return {
                  h2(props) {
                    return <h2 style={{color: 'papayawhip'}} {...props} />
                  }
                }
              }}
            >
              <Content />
            </MDXProvider>
          </MDXProvider>
        ),
        '<h1>hi</h1>\n<h2 style="color:papayawhip;">hello</h2>'
      )
    }
  )
})
