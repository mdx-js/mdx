const babel = require('@babel/core')
const fs = require('fs')
const path = require('path')
const {MDXProvider, mdx: createElement} = require('@mdx-js/react')
const React = require('react')
const {renderToStaticMarkup} = require('react-dom/server')

const mdx = require('../')

const fixture = fs.readFileSync(
  path.join(__dirname, './fixtures/export-with-shortcode.mdx')
)

const transform = code =>
  babel.transform(code, {
    plugins: [
      '@babel/plugin-transform-react-jsx',
      '@babel/plugin-proposal-object-rest-spread',
      'babel-plugin-remove-export-keywords'
    ]
  }).code

const renderWithReact = async mdxCode => {
  const jsx = await mdx(mdxCode, {skipExport: true})
  const code = transform(jsx)
  const scope = {mdx: createElement}

  const fn = new Function( // eslint-disable-line no-new-func
    'React',
    ...Object.keys(scope),
    `${code}; return React.createElement(MDXContent)`
  )

  const element = fn(React, ...Object.values(scope))
  const components = {
    h1: ({children}) =>
      React.createElement('h1', {style: {color: 'tomato'}}, children),
    Button: () => React.createElement('button', {}, 'Hello, button!')
  }

  const elementWithProvider = React.createElement(
    MDXProvider,
    {components},
    element
  )

  return renderToStaticMarkup(elementWithProvider)
}

it('Should use MDX pragma for exports', async () => {
  const result = await renderWithReact(fixture)

  expect(result).toContain('<button>Hello, button!</button>')
})
