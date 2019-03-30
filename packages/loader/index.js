const {getOptions} = require('loader-utils')
const mdx = require('@mdx-js/mdx')

module.exports = async function(content) {
  const callback = this.async()
  const options = Object.assign({}, getOptions(this), {
    filepath: this.resourcePath
  })
  let result

  try {
    result = await mdx(content, options)
  } catch (err) {
    return callback(err)
  }

  const code = `/* @jsx mdx */
  import React from 'react'
  import { mdx } from '@mdx-js/react'
  ${result}
  `

  return callback(null, code)
}
