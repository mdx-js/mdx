import remark from 'remark'

import transformer from './lib/transformer'
import transclude from './lib/transclude'

module.exports = (md, options = {}) =>
  remark()
    .use(transclude, options)
    .use(transformer, options)
    .processSync(md)
    .contents
