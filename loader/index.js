const { getOptions } = require('loader-utils')
const validateOptions = require('schema-utils')
const mdx = require('@compositor/mdx')

const schema = {
  type: 'object',
  properties: {
    // TODO
  }
}

module.exports = function (content) {
  const callback = this.async()
  const options = getOptions(this)
  //validateOptions(schema, options)
  
  const result = mdx(content)

  const code = `
  import React from 'react'
  import { MDXTag } from '@compositor/markdown'
  ${result}
  `

  return callback(null, code)
}
