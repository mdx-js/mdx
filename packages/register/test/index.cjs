/**
 * @typedef {import('mdx/types.js').MDXContent} MDXContent
 */

'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const {test} = require('node:test')
const {pathToFileURL} = require('node:url')
const React = require('react')
const {renderToStaticMarkup} = require('react-dom/server')

test('@mdx-js/register', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(Object.keys(await import('@mdx-js/register')).sort(), [
      'default'
    ])
  })

  await t.test('should work', async function () {
    const folder = pathToFileURL(__filename)
    const mdxUrl = new URL('register.mdx', folder)

    await fs.writeFile(
      mdxUrl,
      'export function Message() { return <>World!</> }\n\n# Hello, <Message />'
    )

    const Content = /** @type {MDXContent} */ (
      /** @type {unknown} */ (
        require('./register.mdx') // type-coverage:ignore-line
      )
    )

    assert.equal(
      renderToStaticMarkup(React.createElement(Content)),
      '<h1>Hello, World!</h1>'
    )

    await fs.rm(mdxUrl)
  })
})
