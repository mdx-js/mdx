const { Asset } = require('parcel-bundler')

const mdx = require('@mdx-js/mdx')

class MDXAsset extends Asset {
  constructor(name, pkg, options) {
    super(name, pkg, options)
    this.type = 'js'
  }

  async generate() {
    let config = await this.getConfig([
      '.mdxrc',
      'mdx.config.js',
      'package.json',
    ], {packageKey: 'mdx'})
    let compiled = await mdx(this.contents, config)
    let fullCode = `
import React from 'react';
import { MDXTag } from '@mdx-js/tag';
${compiled}
`
    return [
      {
        type: 'js',
        value: fullCode,
        sourceMap: undefined,
      },
    ]
  }
}

module.exports = MDXAsset
