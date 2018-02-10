import remark from 'remark'
import toc from 'remark-toc'
import html from 'remark-html'
import slug from 'remark-slug'
import emoji from 'remark-emoji'

import Markdown from './Component'
import transformer from './react-transformer'
import transclude from './transclude'
import relativize from './relativize'
import images from './images'

const md = (text, options = {}) => {
  const plugins = options.plugins || []

  const fn = remark()

  if (!options.hasOwnProperty('transclude') || options.transclude) {
    fn.use(transclude, options)
  }

  fn
    .use(slug, options)
    .use(relativize, options)
    .use(images, options)
    .use(emoji, options)

  plugins.forEach(p => fn.use(p, options))

  if (options.toc) {
    fn.use(toc, options)
  }

  if (options.skipReact) {
    fn.use(html, options)
  } else {
    fn.use(transformer, options)
  }

  return fn
    .processSync(text)
    .contents
}

export {
  md,
  Markdown
}
