const { getOptions } = require('loader-utils')
const mdx = require('@mdx-js/mdx')

module.exports = async function(content) {
  const callback = this.async()
  const options = getOptions(this) || {}

  const result = await mdx(content, options)

  let modulePath = '@mdx-js/tag'

  if (options.absolutePath) {
    modulePath = require.resolve(modulePath)
  }

  const code = `
  import React from 'react'
  import { MDXTag } from '${modulePath}'
  ${result}
  `

  return callback(null, code)
}
