import remark from 'remark'
import toc from 'remark-toc'
import html from 'remark-html'
import emoji from 'remark-emoji'

import Markdown from './Component'
import transformer from './lib/react-transformer'
import transclude from './lib/transclude'
import relativize from './lib/relativize'
import images from './lib/images'

const md = (text, options = {}) => {
  const plugins = options.plugins || []

  const fn = remark()

  if (!options.hasOwnProperty('transclude') || options.transclude) {
    fn.use(transclude, options)
  }

  fn
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

