const {getOptions} = require('loader-utils')
const mdx = require('@mdx-js/mdx')

const DEFAULT_RENDERER = `
import React from 'react'
import { mdx } from '@mdx-js/react'
`

const loader = async function (content) {
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

  const {renderer = DEFAULT_RENDERER} = options

  const code = `${renderer}\n${result}`
  return callback(null, code)
}

module.exports = loader
