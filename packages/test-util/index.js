const babel = require('@babel/core')
const {MDXProvider, mdx: createElement} = require('@mdx-js/react')
const React = require('react')
const {renderToStaticMarkup} = require('react-dom/server')

const mdx = require('@mdx-js/mdx')

const parse = code =>
  babel.parse(code, {
    plugins: [
      '@babel/plugin-syntax-jsx',
      '@babel/plugin-proposal-object-rest-spread'
    ]
  })

const transform = code =>
  babel.transform(code, {
    plugins: [
      '@babel/plugin-transform-react-jsx',
      '@babel/plugin-proposal-object-rest-spread',
      'babel-plugin-remove-export-keywords'
    ]
  }).code

const renderWithReact = async (mdxCode, {components} = {}) => {
  const jsx = await mdx(mdxCode, {skipExport: true})
  const code = transform(jsx)
  const scope = {mdx: createElement}

  const fn = new Function( // eslint-disable-line no-new-func
    'React',
    ...Object.keys(scope),
    `${code}; return React.createElement(MDXContent)`
  )

  const element = fn(React, ...Object.values(scope))

  const elementWithProvider = React.createElement(
    MDXProvider,
    {components},
    element
  )

  return renderToStaticMarkup(elementWithProvider)
}

module.exports.parse = parse
module.exports.transform = transform
module.exports.renderWithReact = renderWithReact
