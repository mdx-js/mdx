/**
 * @typedef {import('mdx/types.js').MDXModule} MDXModule
 * @typedef {import('mdx/types.js').MDXContent} MDXContent
 */

import assert from 'node:assert/strict'
import {promises as fs} from 'node:fs'
import {test} from 'node:test'
import {fileURLToPath} from 'node:url'
import {rollup} from 'rollup'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import rollupMdx from '../index.js'

test('@mdx-js/rollup', async () => {
  await fs.writeFile(
    new URL('rollup.mdx', import.meta.url),
    'export const Message = () => <>World!</>\n\n# Hello, <Message />'
  )

  const bundle = await rollup({
    input: fileURLToPath(new URL('rollup.mdx', import.meta.url)),
    external: ['react/jsx-runtime'],
    plugins: [rollupMdx()]
  })

  const {output} = await bundle.generate({format: 'es', sourcemap: true})

  await fs.writeFile(new URL('rollup.js', import.meta.url), output[0].code)

  /** @type {MDXModule} */
  // @ts-expect-error: dynamically generated file.
  const mod = await import('./rollup.js')
  const Content = mod.default

  assert.equal(
    output[0].map ? output[0].map.mappings : undefined,
    ';;;MAAaA,OAAU,GAAA,MAAAC,GAAA,CAAAC,QAAA,EAAA;AAAQ,EAAA,QAAA,EAAA,QAAA;;;;;;;;AAE7B,IAAA,QAAA,EAAA,CAAA,SAAA,EAAAD,GAAA,CAAA,OAAA,EAAA,EAAA,CAAA,CAAA;;;;;;;;;;;;;;;',
    'should add a source map'
  )

  assert.equal(
    renderToStaticMarkup(React.createElement(Content)),
    '<h1>Hello, World!</h1>',
    'should compile'
  )

  await fs.unlink(new URL('rollup.mdx', import.meta.url))
  await fs.unlink(new URL('rollup.js', import.meta.url))
})
