/**
 * @typedef {import('mdx/types.js').MDXContent} MDXContent
 */

'use strict'

const path = require('path')
const fs = require('fs').promises
const {test} = require('uvu')
const assert = require('uvu/assert')
const React = require('react')
const {renderToStaticMarkup} = require('react-dom/server')

test('@mdx-js/register', async () => {
  const base = path.resolve(path.join('test'))

  await fs.writeFile(
    path.join(base, 'register.mdx'),
    'export const Message = () => <>World!</>\n\n# Hello, <Message />'
  )

  // OMG, it works!
  const Content = /** @type {MDXContent} */ (
    require('./register.mdx') // type-coverage:ignore-line
  )

  assert.equal(
    renderToStaticMarkup(React.createElement(Content)),
    '<h1>Hello, World!</h1>',
    'should compile'
  )

  await fs.unlink(path.join(base, 'register.mdx'))
})

test.run()
