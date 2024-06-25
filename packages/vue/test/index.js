/**
 * @import {Fragment, Jsx} from '@mdx-js/mdx'
 * @import {MDXModule} from 'mdx/types.js'
 * @import {Component} from 'vue'
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import {compile, run} from '@mdx-js/mdx'
import {MDXProvider, useMDXComponents} from '@mdx-js/vue'
import * as runtime_ from 'vue/jsx-runtime'
import * as vue from 'vue'

const runtime = /** @type {{Fragment: Fragment, jsx: Jsx, jsxs: Jsx}} */ (
  /** @type {unknown} */ (runtime_)
)

// Note: a regular import would be nice but that completely messes up the JSX types.
const name = '@vue/server-renderer'
/** @type {{default: {renderToString(node: unknown): string}}} */
const {default: serverRenderer} = await import(name)

test('@mdx-js/vue', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(Object.keys(await import('@mdx-js/vue')).sort(), [
      'MDXProvider',
      'useMDXComponents'
    ])
  })

  await t.test('should evaluate MDX code', async function () {
    const {default: Content} = await evaluate('# hi')

    assert.equal(await vueToString(Content), '<h1>hi</h1>')
  })

  await t.test(
    'should evaluate some more complex MDX code (text, inline)',
    async function () {
      const {default: Content} = await evaluate(
        '*a* **b** `c` <abbr title="Markdown + JSX">MDX</abbr>'
      )

      assert.equal(
        await vueToString(Content),
        '<p><em>a</em> <strong>b</strong> <code>c</code> <abbr title="Markdown + JSX">MDX</abbr></p>'
      )
    }
  )

  await t.test(
    'should support Vue components defined in MDX',
    async function () {
      const {default: Content} = await evaluate(
        'export const A = {render() { return <b>!</b> }}\n\n<A />'
      )

      assert.equal(await vueToString(Content), '<b>!</b>')
    }
  )

  await t.test('should support passing `components`', async function () {
    const {default: Content} = await evaluate('# hi')

    assert.equal(
      await vueToString(Content, {components: {h1: 'h2'}}),
      '<h2>hi</h2>'
    )
  })

  await t.test('should support passing `components`', async function () {
    const {default: Content} = await evaluate('# hi')

    assert.equal(
      await vueToString(Content, {components: {h1: 'h2'}}),
      '<h2>hi</h2>'
    )
  })

  await t.test('should support `MDXProvider`', async function () {
    const {default: Content} = await evaluate('# hi')

    assert.equal(
      await vueToString({
        components: {Content, MDXProvider},
        data() {
          return {components: {h1: 'h2'}}
        },
        template:
          '<MDXProvider v-bind:components="components"><Content /></MDXProvider>'
      }),
      '<h2>hi</h2>'
    )
  })

  await t.test(
    'should support the MDX provider w/o components',
    async function () {
      const {default: Content} = await evaluate('# hi')

      assert.equal(
        await vueToString({
          components: {Content, MDXProvider},
          template: '<MDXProvider><Content /></MDXProvider>'
        }),
        '<h1>hi</h1>'
      )
    }
  )

  await t.test(
    'should support the MDX provider w/o content',
    async function () {
      assert.equal(
        await vueToString({
          components: {MDXProvider},
          template: '<MDXProvider />'
        }),
        ''
      )
    }
  )
})

/**
 * @param {string} value
 *   MDX.
 * @returns {Promise<MDXModule>}
 *   Module.
 */
async function evaluate(value) {
  const file = await compile(value, {
    outputFormat: 'function-body',
    providerImportSource: '#'
  })
  return run(file, {...runtime, useMDXComponents})
}

/**
 * @param {Component} root
 *   Component.
 * @param {Record<string, unknown> | null | undefined} [rootProperties]
 *   Props.
 * @returns {Promise<string>}
 *   HTML.
 */
async function vueToString(root, rootProperties) {
  const result = await serverRenderer.renderToString(
    vue.createSSRApp(root, rootProperties)
  )
  // Remove SSR comments used to hydrate.
  return result.replaceAll(/<!--[[\]]-->/g, '')
}
