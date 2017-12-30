const fs = require('fs')
const test = require('ava')
const React = require('react')
const remark = require('remark')
const { renderToString } = require('react-dom/server')

const Markdown = require('../src/Component').default

test('renders the component as markdown', t => {
  const md = fs.readFileSync('test/fixtures/basic.md', 'utf8')

  const result = renderToString(<Markdown text={md} />)

  t.snapshot(result)
})
