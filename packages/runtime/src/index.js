import React from 'react'
import { transform } from 'buble'
import mdx from '@mdx-js/mdx'
import { MDXTag } from '@mdx-js/tag'

export default ({ scope = {}, components = {}, children }) => {
  const fullScope = {
    MDXTag,
    components,
    ...scope
  }

  // We should add this as an output option to mdx core so we don't
  // need to do hacky regexing.
  const jsx = mdx.sync(children).replace(/^(\s)*export default \({components}\) =>/, '')
  const { code } = transform(jsx)

  const keys = Object.keys(fullScope)
  const values = keys.map(key => fullScope[key])
  const fn = new Function('_fn', 'React', ...keys, `return ${code}`)

  return fn({}, React, ...values)
}
