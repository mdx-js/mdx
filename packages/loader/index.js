import {getOptions} from 'loader-utils'
import {createCompiler} from '@mdx-js/mdx'

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

export default async function (content) {
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
  return callback(null, code)
}
