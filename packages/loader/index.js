const {getOptions} = require('loader-utils')
const mdx = require('@mdx-js/mdx')

const DEFAULT_PREPEND = `
  import React from 'react'
  import { mdx } from '@mdx-js/react'
`
  .split('\n')
  .map(l => l.trim())

const loader = async function(content) {
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

  const {prepend = DEFAULT_PREPEND} = options

  const code = `${prepend}\n${result}`
  return callback(null, code)
}

module.exports = loader
