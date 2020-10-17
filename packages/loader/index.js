const {getOptions} = require('loader-utils')
const mdx = require('@mdx-js/mdx')
const path = require('path')

let defaultRenderer = null

function getDefaultRenderer() {
  if (!defaultRenderer) {
    defaultRenderer = `
import React from '${path.dirname(
      require.resolve('react/package.json').replace(/\\/g, '/')
    )}'
import { mdx } from '${path
      .dirname(require.resolve('@mdx-js/react/package.json'))
      .replace(/\\/g, '/')}'
`
  }

  return defaultRenderer
}

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

  const {renderer = getDefaultRenderer()} = options

  const code = `${renderer}\n${result}`
  return callback(null, code)
}

module.exports = loader
