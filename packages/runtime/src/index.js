import React from 'react'
import mdx from '@mdx-js/mdx'
import {MDXProvider, mdx as createElement} from '@mdx-js/react'

const suffix = `return React.createElement(
  MDXProvider,
  {components},
  React.createElement(MDXContent, props)
)`

export default ({
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

  const js = mdx
    .sync(children, {
      remarkPlugins,
      rehypePlugins,
      skipExport: true
    })
    .trim()

  const keys = Object.keys(fullScope)
  const values = Object.values(fullScope)

  // eslint-disable-next-line no-new-func
  const fn = new Function('React', ...keys, `${js}\n\n${suffix}`)

  return fn(React, ...values)
}
