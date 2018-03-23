const { getOptions } = require('loader-utils')
const mdx = require('@compositor/mdx')

module.exports = function (content) {
  const callback = this.async()
  const options = getOptions(this)

  const result = mdx(content, options || {})

  const code = `
  import React from 'react'
  import { MDXTag } from '@compositor/markdown'
  ${result}
  `

  return callback(null, code)
}
