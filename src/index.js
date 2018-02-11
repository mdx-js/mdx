import unified from 'unified'
import parse from 'remark-parse'
import stringify from 'remark-stringify'
import toc from 'remark-toc'
import html from 'remark-html'
import slug from 'remark-slug'
import emoji from 'remark-emoji'
import matter from 'remark-frontmatter'

import Markdown from './Component'
import jsx from './jsx'
import transformer from './react-transformer'
import transclude from './transclude'
import relativize from './relativize'
import imports from './imports'
import images from './images'

const md = (text, options = {}) => {
  const plugins = options.plugins || []

  const fn = unified()
    .use(parse)
    .use(stringify)

  if (!options.hasOwnProperty('transclude') || options.transclude) {
    fn.use(transclude, options)
  }

  fn
    .use(matter, { type: 'yaml', marker: '-' })
    .use(imports, options)
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
    fn
      .use(jsx, options)
      .use(transformer, options)
  }

  return fn
    .processSync(text)
    .contents
}

export {
  md,
  Markdown
}
