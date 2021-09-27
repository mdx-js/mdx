/**
 * @typedef {import('react').FC} FC
 */

import {promises as fs} from 'fs'
import {URL, fileURLToPath} from 'url'
import {test} from 'uvu'
import * as assert from 'uvu/assert'
import {rollup} from 'rollup'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server.js'
import rollupMdx from '../index.js'

test('@mdx-js/rollup', async () => {
  await fs.writeFile(
    new URL('./rollup.mdx', import.meta.url),
    'export const Message = () => <>World!</>\n\n# Hello, <Message />'
  )

  const bundle = await rollup({
    input: fileURLToPath(new URL('./rollup.mdx', import.meta.url)),
    external: ['react/jsx-runtime'],
    plugins: [rollupMdx()]
  })

  await fs.writeFile(
    new URL('./rollup.js', import.meta.url),
    (
      await bundle.generate({format: 'es'})
    ).output[0].code.replace(/\/jsx-runtime(?=["'])/g, '$&.js')
  )

  const Content = /** @type {FC} */ (
    /* @ts-expect-error file is dynamically generated */
    (await import('./rollup.js')).default // type-coverage:ignore-line
  )

  assert.equal(
    renderToStaticMarkup(React.createElement(Content)),
    '<h1>Hello, World!</h1>',
    'should compile'
  )

  await fs.unlink(new URL('./rollup.mdx', import.meta.url))
  await fs.unlink(new URL('./rollup.js', import.meta.url))
})

test.run()
