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

  const escapedContent = content.replace(/`/g, '\\`')
  
  const result = mdx(escapedContent)

  const code = `
  import React from 'react'
  import { Tag } from '@compositor/markdown'
  ${result}
  `

  console.log(code)

  return callback(null, code)
}
