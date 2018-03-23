const { getOptions } = require('loader-utils')
const mdx = require('@mdx-js/mdx')

module.exports = function(content) {
  const callback = this.async()
  const options = getOptions(this)

  const result = mdx(content, options || {})

  const code = `
  import React from 'react'
  import { MDXTag } from '@mdx-js/tag'
  ${result}
  `

  console.log(code)

  return callback(null, code)
}
