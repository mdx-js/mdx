const { getOptions } = require('loader-utils')
const mdx = require('@mdx-js/mdx')

function getImportCode(options) {
  const isVueCompiler = options.compilers ? options.compilers.find(c => c.name === 'VueJSXCompiler') : false
  if (isVueCompiler) {
    return `
    import { MDXTag } from '@mdx-js/vue-plugin-mdx'
    `;
  }
  return `
  import React from 'react'
  import { MDXTag } from '@mdx-js/tag'
  `;
}

module.exports = async function(content) {
  const callback = this.async()
  const options = getOptions(this) || {}

  const result = await mdx(content, options)

  const code = `
  ${getImportCode(options)}
  ${result}
  `

  return callback(null, code)
}
