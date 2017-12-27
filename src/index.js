import remark from 'remark'
import toc from 'remark-toc'
import emoji from 'remark-emoji'

import transformer from './lib/transformer'
import transclude from './lib/transclude'
import images from './lib/images'

module.exports = (md, options = {}) => {
  const plugins = options.plugins || []

  const fn = remark()

  if (!options.hasOwnProperty('transclude') || options.transclude) {
    fn.use(transclude, options)
  }

  fn
    .use(images, options)
    .use(emoji, options)

  plugins.forEach(p => fn.use(p, options))

  if (options.toc) {
    fn.use(toc, options)
  }

  return fn
    .use(transformer, options)
    .processSync(md)
    .contents
}
