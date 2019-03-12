const babel = require('@babel/core')
const React = require('react')
const {renderToStaticMarkup} = require('react-dom/server')
const {MDXProvider} = require('@mdx-js/tag')

const mdx = require('../../mdx')
const createElement = require('../../mdx/create-element')

const fixtures = require('./fixtures/block-parsing')

const transform = code =>
  babel.transform(code, {
    plugins: [
      '@babel/plugin-transform-react-jsx',
      '@babel/plugin-proposal-object-rest-spread'
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
      React.createElement('h1', {style: {color: 'tomato'}}, children)
  }

  const elementWithProvider = React.createElement(
    MDXProvider,
    {components},
    element
  )

  return renderToStaticMarkup(elementWithProvider)
}

fixtures.forEach(fixture => {
  it(fixture.description, async () => {
    const result = await renderWithReact(fixture.mdx)

    console.log(result)

    expect(result.trim()).toMatchSnapshot()
  })
})
