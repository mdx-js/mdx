import Bundler from 'parcel-bundler'

import {mdx} from '@mdx-js/mdx'

const prefix = `import React from 'react'
import {mdx} from '@mdx-js/react'
`

export default class MDXAsset extends Bundler.Asset {
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

    return [{type: 'js', value: prefix + compiled}]
  }
}
