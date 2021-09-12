const React = require('react')
const {transform} = require('buble-jsx-only')
const mdx = require('@mdx-js/mdx')
const {MDXProvider, mdx: createElement} = require('@mdx-js/react')

const suffix = `return React.createElement(
  MDXProvider,
  {components},
  React.createElement(MDXContent, props)
)`

const runtime = ({
  scope = {},
  components = {},
  remarkPlugins = [],
  rehypePlugins = [],
  children,
  ...props
}) => {
  const fullScope = {
    mdx: createElement,
    MDXProvider,
    components,
    props,
    ...scope
  }

  const jsx = mdx
    .sync(children, {
      remarkPlugins,
      rehypePlugins,
      skipExport: true
    })
    .trim()

  const {code} = transform(jsx, {objectAssign: 'Object.assign'})

  const keys = Object.keys(fullScope)
  const values = Object.values(fullScope)

  // eslint-disable-next-line no-new-func
  const fn = new Function('React', ...keys, `${code}\n\n${suffix}`)

  return fn(React, ...values)
}

module.exports = runtime
