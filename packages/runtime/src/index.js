import React from 'react'
import {transform} from 'buble-jsx-only'
import mdx from '@mdx-js/mdx'
import {MDXProvider, useMDXComponents} from '@mdx-js/react'

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
    React,
    MDXProvider,
    __provideComponents: useMDXComponents,
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
    .replace(/import \{.+?\} from "@mdx-js\/react";/g, '')

  const code = transform(jsx, {objectAssign: 'Object.assign'}).code

  const keys = Object.keys(fullScope)
  const values = Object.values(fullScope)

  // eslint-disable-next-line no-new-func
  const fn = new Function(...keys, `${code}\n\n${suffix}`)

  return fn(...values)
}
