import remark from 'remark'
import toc from 'remark-toc'

import transformer from './lib/transformer'
import transclude from './lib/transclude'
import images from './lib/images'

module.exports = (md, options = {}) => {
  const plugins = options.plugins || []

  const fn = remark()
    .use(transclude, options)
    .use(images, options)

  plugins.forEach(p => fn.use(p, options))

  if (options.toc) {
    fn.use(toc, options)
  }

  return fn
    .use(transformer, options)
    .processSync(md)
    .contents
}
