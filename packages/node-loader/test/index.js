/**
 * @typedef {import('mdx/types.js').MDXContent} MDXContent
 */

import assert from 'node:assert/strict'
import {promises as fs} from 'node:fs'
import {test} from 'node:test'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'

test('@mdx-js/node-loader', async () => {
  await fs.writeFile(
    new URL('esm-loader.mdx', import.meta.url),
    'export const Message = () => <>World!</>\n\n# Hello, <Message />'
  )

  /** @type {MDXContent} */
  let Content

  try {
    const mod = await import('./esm-loader.mdx')
    Content = mod.default
  } catch (error) {
    const exception = /** @type {NodeJS.ErrnoException} */ (error)
    if (exception.code === 'ERR_UNKNOWN_FILE_EXTENSION') {
      await fs.unlink(new URL('esm-loader.mdx', import.meta.url))
      throw new Error(
        'Please run Node with `--experimental-loader=./esm-loader.js` to test the ESM loader'
      )
    }

    throw error
  }

  assert.equal(
    renderToStaticMarkup(React.createElement(Content)),
    '<h1>Hello, World!</h1>',
    'should compile'
  )

  await fs.unlink(new URL('esm-loader.mdx', import.meta.url))
})
