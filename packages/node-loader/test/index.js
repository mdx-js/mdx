/**
 * @typedef {import('mdx/types.js').MDXModule} MDXModule
 */

import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import {test} from 'node:test'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'

test('@mdx-js/node-loader', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(Object.keys(await import('@mdx-js/node-loader')).sort(), [
      'createLoader',
      'load'
    ])
  })

  await t.test('should work', async function () {
    const mdxUrl = new URL('node-loader.mdx', import.meta.url)

    await fs.writeFile(
      mdxUrl,
      'export function Message() { return <>World!</> }\n\n# Hello, <Message />'
    )

    /** @type {MDXModule} */
    let result

    try {
      result = await import(mdxUrl.href)
    } catch (error) {
      const exception = /** @type {NodeJS.ErrnoException} */ (error)

      if (exception.code === 'ERR_UNKNOWN_FILE_EXTENSION') {
        await fs.rm(mdxUrl)

        throw new Error(
          'Please run Node with `--loader=@mdx-js/node-loader` to test the ESM loader'
        )
      }

      throw error
    }

    const Content = result.default

    assert.equal(
      renderToStaticMarkup(React.createElement(Content)),
      '<h1>Hello, World!</h1>'
    )

    await fs.rm(mdxUrl)
  })
})
