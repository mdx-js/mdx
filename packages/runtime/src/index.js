import React from 'react'
import { transform } from 'buble'
import mdx from '@mdx-js/mdx'
import { MDXTag } from '@mdx-js/tag'

export default ({ scope = {}, components = {}, children, ...props }) => {
  const fullScope = {
    MDXTag,
    components,
    props,
    ...scope
  }

  const jsx = mdx.sync(children, { skipExport: true }).trim()

  let code = null;

  try {
    code = transform(jsx).code
  } catch(error) {
    console.log(error);
  }

  const keys = Object.keys(fullScope)
  const values = keys.map(key => fullScope[key])
  const fn = new Function('_fn', 'React', ...keys, `return ${code}`)

  return fn({}, React, ...values)
}
