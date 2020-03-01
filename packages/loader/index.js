const {getOptions} = require('loader-utils')
const mdx = require('@mdx-js/mdx')

const DEFAULT_RENDERER = `
import React from 'react'
import { mdx } from '@mdx-js/react'
`

const loader = async function(content) {
  const callback = this.async()
  const options = Object.assign({}, getOptions(this), {
    filepath: this.resourcePath
  })

  const {
    renderer = DEFAULT_RENDERER,
    header,
    footer,
    defaultExport = true
  } = options

  let headerCode = ''
  if (header) {
    if (typeof header === 'string') {
      headerCode = `${header}\n`
    } else if (typeof header === 'function') {
      headerCode = `${await header(options.filepath)}\n`
    } else {
      return callback(new Error('header option must be a string or a function'))
    }
  }

  let footerCode = ''
  if (footer) {
    if (typeof footer === 'string') {
      footerCode = `\n${footer}`
    } else if (typeof footer === 'function') {
      footerCode = `\n${await footer(options.filepath)}`
    } else {
      return callback(new Error('footer option must be a string or a function'))
    }
  }

  let result

  try {
    result = await mdx(`${headerCode}${content}`, options)
    if (!defaultExport) {
      result = result.replace(
        'export default function MDXContent',
        'export function MDXContent'
      )
    }
  } catch (err) {
    return callback(err)
  }

  const code = `${renderer}\n${result}${footerCode}`
  return callback(null, code)
}

module.exports = loader
