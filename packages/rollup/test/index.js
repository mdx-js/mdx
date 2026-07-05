/**
 * @import {Root} from 'mdast'
 * @import {MDXModule} from 'mdx/types.js'
 * @import {RollupOutput, RollupLog} from 'rollup'
 * @import {VFileMessage} from 'vfile-message'
 */

import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import {test} from 'node:test'
import {fileURLToPath} from 'node:url'
import rollupMdx from '@mdx-js/rollup'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {rollup} from 'rollup'
import {build} from 'vite'

test('@mdx-js/rollup', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(Object.keys(await import('@mdx-js/rollup')).sort(), [
      'default'
    ])
  })

  await t.test('should work', async function () {
    const mdxUrl = new URL('rollup.mdx', import.meta.url)
    const jsUrl = new URL('rollup.js', import.meta.url)

    await fs.writeFile(
      mdxUrl,
      'export function Message() { return <>World!</> }\n\n# Hello, <Message />'
    )

    const build = await rollup({
      external: ['react/jsx-runtime'],
      input: fileURLToPath(mdxUrl),
      plugins: [rollupMdx()]
    })

    const {output} = await build.generate({format: 'es', sourcemap: true})
    const chunk = output[0]

    // Source map.
    assert.equal(
      chunk.map?.mappings,
      ';;AAAO,SAAA,OAAA,GAAA;;AAA8B,IAAA,QAAA,EAAA;;;;;;;;;AAEnC,IAAA,QAAA,EAAA,CAAA,SAAA,EAAAA,GAAA,CAAA,OAAA,EAAA,EAAA,CAAA;;;;;;;;;;;;;;;'
    )

    await fs.writeFile(jsUrl, chunk.code)

    /** @type {MDXModule} */
    const result = await import(jsUrl.href)
    const Content = result.default

    assert.equal(
      renderToStaticMarkup(React.createElement(Content)),
      '<h1>Hello, World!</h1>'
    )

    await fs.rm(mdxUrl)
    await fs.rm(jsUrl)
  })

  await t.test('should infer production mode in vite', async () => {
    const result = /** @type {Array<RollupOutput>} */ (
      await build({
        build: {
          lib: {
            entry: fileURLToPath(new URL('vite-entry.mdx', import.meta.url)),
            name: 'production'
          },
          write: false
        },
        logLevel: 'silent',
        plugins: [rollupMdx()]
      })
    )

    const code = result[0].output[0].code

    assert.match(code, /jsxs?\(/)
    assert.doesNotMatch(code, /jsxDEV\(/)
  })

  await t.test('should infer development mode in vite', async () => {
    const result = /** @type {Array<RollupOutput>} */ (
      await build({
        build: {
          lib: {
            entry: fileURLToPath(new URL('vite-entry.mdx', import.meta.url)),
            name: 'production'
          },
          write: false
        },
        logLevel: 'silent',
        mode: 'development',
        plugins: [rollupMdx()]
      })
    )

    const code = result[0].output[0].code

    assert.doesNotMatch(code, /jsxs?\(/)
    assert.match(code, /jsxDEV\(/)
  })

  await t.test('should handle query parameters in vite', async () => {
    const result = /** @type {Array<RollupOutput>} */ (
      await build({
        build: {
          lib: {
            entry:
              fileURLToPath(new URL('vite-entry.mdx', import.meta.url)) +
              '?query=param',
            name: 'query'
          },
          write: false
        },
        logLevel: 'silent',
        plugins: [rollupMdx()]
      })
    )

    const code = result[0].output[0].code

    assert.match(code, /Hello Vite/)
    assert.match(code, /jsxs?\(/)
  })

  await t.test('should log vfile messages', async () => {
    /** @type {VFileMessage | undefined} */
    let info
    /** @type {VFileMessage | undefined} */
    let withRuleId
    /** @type {VFileMessage | undefined} */
    let withSource
    /** @type {VFileMessage | undefined} */
    let withSourceAndRuleId
    /** @type {RollupLog[]} */
    const logs = []
    const input = fileURLToPath(new URL('vite-entry.mdx', import.meta.url))

    await rollup({
      external: ['react/jsx-runtime'],
      input,
      onLog(level, log) {
        logs.push(
          /** @type {RollupLog} */ (
            // Strip symbol keys
            Object.fromEntries(Object.entries(log))
          )
        )
      },
      plugins: [
        rollupMdx({
          remarkPlugins: [
            () =>
              /**
               * @param {Root} ast
               */
              (ast, file) => {
                info = file.info('info with location', ast)
                withSource = file.message('warning with source', {
                  source: 'source'
                })
                withRuleId = file.message('warning with ruleId', {
                  ruleId: 'rule-id'
                })
                withSourceAndRuleId = file.message(
                  'warning with source and ruleId',
                  {
                    source: 'source',
                    ruleId: 'rule-id'
                  }
                )
              }
          ]
        })
      ]
    })

    assert.deepEqual(logs, [
      {
        cause: info,
        code: 'PLUGIN_LOG',
        hook: 'transform',
        id: input,
        loc: {
          column: 1,
          file: input,
          line: 1
        },
        message:
          '[plugin @mdx-js/rollup] test/vite-entry.mdx (1:1): info with location',
        plugin: '@mdx-js/rollup'
      },
      {
        cause: withSource,
        code: 'PLUGIN_WARNING',
        hook: 'transform',
        id: input,
        message:
          '[plugin @mdx-js/rollup] test/vite-entry.mdx: warning with source',
        plugin: '@mdx-js/rollup',
        pluginCode: 'source'
      },
      {
        cause: withRuleId,
        code: 'PLUGIN_WARNING',
        hook: 'transform',
        id: input,
        message:
          '[plugin @mdx-js/rollup] test/vite-entry.mdx: warning with ruleId',
        plugin: '@mdx-js/rollup',
        pluginCode: 'rule-id'
      },
      {
        cause: withSourceAndRuleId,
        code: 'PLUGIN_WARNING',
        hook: 'transform',
        id: input,
        message:
          '[plugin @mdx-js/rollup] test/vite-entry.mdx: warning with source and ruleId',
        plugin: '@mdx-js/rollup',
        pluginCode: 'source:rule-id'
      }
    ])
  })

  await t.test('should support the `?raw` query', async () => {
    const result = /** @type {Array<RollupOutput>} */ (
      await build({
        build: {
          lib: {
            entry:
              fileURLToPath(new URL('vite-entry.mdx', import.meta.url)) +
              '?raw',
            name: 'query'
          },
          write: false
        },
        logLevel: 'silent',
        plugins: [rollupMdx()]
      })
    )

    const code = result[0].output[0].code

    assert.match(code, /# Hello Vite/)
    assert.doesNotMatch(code, /jsxs/)
  })

  await t.test('should support the ?url query', async () => {
    const result = /** @type {Array<RollupOutput>} */ (
      await build({
        build: {
          lib: {
            entry:
              fileURLToPath(new URL('vite-entry.mdx', import.meta.url)) +
              '?url',
            name: 'query'
          },
          write: false
        },
        logLevel: 'silent',
        plugins: [rollupMdx()]
      })
    )

    const code = result[0].output[0].code

    assert.match(code, /data:text\/mdx;base64/)
    assert.doesNotMatch(code, /jsxs/)
  })
})
