import remark from 'remark'
import toHast from 'mdast-util-to-hast'
import toHyper from 'hast-to-hyperscript'

import { createElement } from 'react'

import transformer from './lib/transformer'

module.exports = (md, options = {}) =>
  remark()
    .use(transformer, options)
    .processSync(md)
    .contents
