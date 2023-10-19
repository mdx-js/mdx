/**
 * @typedef {import('mdx/types.js').MDXModule} MDXModule
 */

import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import {test} from 'node:test'
import {fileURLToPath} from 'node:url'
import rollupMdx from '@mdx-js/rollup'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {rollup} from 'rollup'

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
      ';;;AAAO,SAAA,OAAA,GAAA;;AAA8B,IAAA,QAAA,EAAA,QAAA;;;;;;;;;AAEnC,IAAA,QAAA,EAAA,CAAA,SAAA,EAAAA,GAAA,CAAA,OAAA,EAAA,EAAA,CAAA,CAAA;;;;;;;;;;;;;;;'
    )

    await fs.writeFile(jsUrl, chunk.code)

    /** @type {MDXModule} */
    const mod = await import(jsUrl.href)
    const Content = mod.default

    assert.equal(
      renderToStaticMarkup(React.createElement(Content)),
      '<h1>Hello, World!</h1>'
    )

    await fs.rm(mdxUrl)
    await fs.rm(jsUrl)
  })
})
