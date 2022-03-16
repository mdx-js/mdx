/**
 * @typedef {import('mdx/types').MDXContent} MDXContent
 */

import {promises as fs} from 'fs'
import {test} from 'uvu'
import * as assert from 'uvu/assert'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server.js'

test('@mdx-js/node-loader', async () => {
  await fs.writeFile(
    new URL('./esm-loader.mdx', import.meta.url),
    'export const Message = () => <>World!</>\n\n# Hello, <Message />'
  )

  /** @type {MDXContent} */
  let Content

  try {
    Content = (await import('./esm-loader.mdx')).default // type-coverage:ignore-line
  } catch (error) {
    const exception = /** @type {NodeJS.ErrnoException} */ (error)
    if (exception.code === 'ERR_UNKNOWN_FILE_EXTENSION') {
      await fs.unlink(new URL('./esm-loader.mdx', import.meta.url))
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

  await fs.unlink(new URL('./esm-loader.mdx', import.meta.url))
})

test.run()
