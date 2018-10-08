import React from 'react'
import { transform } from 'buble'
import mdx from '@mdx-js/mdx'
import { MDXTag } from '@mdx-js/tag'

export default ({ scope = {}, components = {}, mdPlugins = [], hastPlugins = [], children, ...props }) => {
  const fullScope = {
    MDXTag,
    components,
    props,
    ...scope
  }

  const jsx = mdx.sync(children, {
    mdPlugins,
    hastPlugins,
    skipExport: true,
  }).trim()

  const { code } = transform(jsx)

  const keys = Object.keys(fullScope)
  const values = keys.map(key => fullScope[key])
  const fn = new Function('_fn', 'React', ...keys, `return ${code}`)

  return fn({}, React, ...values)
}
