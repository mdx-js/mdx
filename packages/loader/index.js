const { getOptions } = require('loader-utils')
const mdx = require('@mdx-js/mdx')

module.exports = async function(content) {
  const callback = this.async()
  const options = getOptions(this)

  const result = await mdx(content, options || {})

  if(typeof options !== "undefined" && typeof options.process == "function")
    return callback(null, options.process(result))

  const code = `
  import React from 'react'
  import { MDXTag } from '@mdx-js/tag'
  ${result}
  `

  return callback(null, code)
}
