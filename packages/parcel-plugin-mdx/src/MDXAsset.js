const {Asset} = require('parcel-bundler')

const mdx = require('@mdx-js/mdx')

const prefix = `import React from 'react'
import {mdx} from '@mdx-js/react'
`

class MDXAsset extends Asset {
  constructor(name, options) {
    super(name, options)
    this.type = 'js'
    this.hmrPageReload = true
  }

  async generate() {
    const config = await this.getConfig(
      ['.mdxrc', 'mdx.config.js', 'package.json'],
      {packageKey: 'mdx'}
    )
    const compiled = await mdx(this.contents, config)

    // V8 bug on Node 12.
    /* c8 ignore next 2 */
    return [{type: 'js', value: prefix + compiled}]
  }
}

module.exports = MDXAsset
