const {Asset} = require('parcel-bundler')

const mdx = require('@mdx-js/mdx')
const path = require('path')

class MDXAsset extends Asset {
  constructor(name, pkg, options) {
    super(name, pkg, options)
    this.type = 'js'
  }

  async generate() {
    const config = await this.getConfig(
      ['.mdxrc', 'mdx.config.js', 'package.json'],
      {packageKey: 'mdx'}
    )
    const compiled = await mdx(this.contents, config)
    const fullCode = `/* @jsx mdx */
import React from '${path
      .dirname(require.resolve('react/package.json'))
      .replace(/\\/g, '/')}';
import { mdx } from '${path
      .dirname(require.resolve('@mdx-js/react/package.json'))
      .replace(/\\/g, '/')}'
${compiled}
`
    return [
      {
        type: 'js',
        value: fullCode,
        sourceMap: undefined
      }
    ]
  }
}

module.exports = MDXAsset
