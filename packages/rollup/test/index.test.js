/**
 * @typedef {import('mdx/types').MDXContent} MDXContent
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

  const {output} = await bundle.generate({format: 'es', sourcemap: true})

  await fs.writeFile(new URL('./rollup.js', import.meta.url), output[0].code)

  const Content = /** @type {MDXContent} */ (
    /* @ts-expect-error file is dynamically generated */
    (await import('./rollup.js')).default // type-coverage:ignore-line
  )

  assert.equal(
    output[0].map ? output[0].map.mappings : undefined,
    ';;;MAAaA,UAAU;YAAQ;;;;;;;;;;;;iBAE7B;;;;;;;',
    'should add a source map'
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
