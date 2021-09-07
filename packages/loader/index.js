const {getOptions} = require('loader-utils')
const {createCompiler} = require('@mdx-js/mdx')

const DEFAULT_RENDERER = `
import React from 'react'
import {mdx} from '@mdx-js/react'
`

const pragma = `
/* @jsxRuntime classic */
/* @jsx mdx */
/* @jsxFrag mdx.Fragment */
`

const compilerCache = new Map()

module.exports = async function (content) {
  if (!compilerCache.has(this.query)) {
    const {renderer = DEFAULT_RENDERER, ...opts} = getOptions(this)
    compilerCache.set(this.query, [renderer, createCompiler(opts)])
  }

  const callback = this.async()
  const [renderer, compiler] = compilerCache.get(this.query)

  let result

  try {
    result = await compiler.process({
      contents: content,
      path: this.resourcePath
    })
  } catch (err) {
    return callback(err)
  }

  const code = `${renderer}${pragma}${result}`
  // V8 bug on Node 12.
  /* c8 ignore next 2 */
  return callback(null, code)
}
