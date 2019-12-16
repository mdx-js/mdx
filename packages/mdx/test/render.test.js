const fs = require('fs')
const path = require('path')
const React = require('react')
const {renderWithReact} = require('@mdx-js/test-util')

const EXPORT_SHORTCODE_FIXTURE = fs.readFileSync(
  path.join(__dirname, './fixtures/export-with-shortcode.mdx')
)
const PONYLANG_FIXTURE = fs.readFileSync(
  path.join(__dirname, './fixtures/ponylang.mdx')
)
const IMPORT_FIXTURE = fs.readFileSync(
  path.join(__dirname, './fixtures/imports.mdx')
)

const components = {
  h1: ({children}) =>
    React.createElement('h1', {style: {color: 'tomato'}}, children),
  Button: () => React.createElement('button', {}, 'Hello, button!'),
  del: ({children}) =>
    React.createElement('del', {style: {color: 'crimson'}}, children)
}

it('renders using components from context', async () => {
  const result = await renderWithReact(`# Hello, world!`, {components})

  expect(result).toContain('<h1 style="color:tomato">Hello, world!</h1>')
})

it('processes exports for MDX pragma', async () => {
  const result = await renderWithReact(EXPORT_SHORTCODE_FIXTURE, {components})

  expect(result).toContain('<button>Hello, button!</button>')
})

it('uses fragment as a wrapper', async () => {
  const result = await renderWithReact(`# Hello, world!`, {components})

  expect(result).toEqual('<h1 style="color:tomato">Hello, world!</h1>')
})

it('does not escape literals in code blocks or inline code', async () => {
  await expect(() => renderWithReact(PONYLANG_FIXTURE)).not.toThrow()
})

it('turns newline into a space with adjacent anchors', async () => {
  const result = await renderWithReact(`
  [foo](/foo)
  [bar](/bar)
  `)

  expect(result).toContain('<a href="/foo">foo</a>\n<a href="/bar">bar</a>')
})

it('turns a newline into a space with other adjacent phrasing content', async () => {
  const result = await renderWithReact(`
  *foo*
  \`bar\`
  `)

  expect(result).toContain('<em>foo</em>\n<code>bar</code>')
})

it('ignores escaped import wording', async () => {
  const result = await renderWithReact(IMPORT_FIXTURE)

  expect(result).toContain('<li>import')
  expect(result).toContain('<li>export')
})

it('renders delete component from context', async () => {
  const result = await renderWithReact(`Hello, ~~world~~ MDX!`, {components})

  expect(result).toContain(
    '<p>Hello, <del style="color:crimson">world</del> MDX!</p>'
  )
})
