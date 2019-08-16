import React from 'react'
import {transform} from '@babel/standalone'
import babelPluginJsx from '@babel/plugin-transform-react-jsx'
import babelPluginSpread from '@babel/plugin-proposal-object-rest-spread'
import babelPluginExports from 'babel-plugin-remove-export-keywords'
import mdx from '@mdx-js/mdx'
import {MDXProvider, mdx as createElement} from '@mdx-js/react'

export default ({
  scope = {},
  components = {},
  remarkPlugins = [],
  rehypePlugins = [],
  babelPlugins = [],
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

  const {code} = transform(jsx, {
    plugins: [
      babelPluginJsx,
      babelPluginSpread,
      babelPluginExports,
      ...babelPlugins
    ]
  })

  const keys = Object.keys(fullScope)
  const values = Object.values(fullScope)
  // eslint-disable-next-line no-new-func
  const fn = new Function(
    '_fn',
    'React',
    ...keys,
    `${code}

    return React.createElement(MDXProvider, { components },
      React.createElement(MDXContent, props)
    );`
  )

  return fn({}, React, ...values)
}
