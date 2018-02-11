import React from 'react'
import unified from 'unified'
import parse from 'remark-parse'
import stringify from 'remark-stringify'
import toc from 'remark-toc'
import html from 'remark-html'
import slug from 'remark-slug'
import emoji from 'remark-emoji'
import matter from 'remark-frontmatter'
import squeeze from 'remark-squeeze-paragraphs'
import toHast from '@dumpster/remark-custom-element-to-hast'
import renderer from '@dumpster/hast-react-renderer'

import Markdown from './Component'
import jsx from './jsx'
import transformer from './react-transformer'
import relativize from './relativize'
import imports from './imports'
import images from './images'
import unnest from './unnest-custom-elements'

const md = (text, options = {}) => {
  const plugins = options.plugins || []
  const components = options.components || {}

  options.componentWhitelist = Object.keys(components)

  const fn = unified()
    .use(parse)
    .use(stringify)
    .use(matter, { type: 'yaml', marker: '-' })
    .use(imports, options)
    .use(slug, options)
    .use(relativize, options)
    .use(images, options)
    .use(emoji, options)
    .use(squeeze, options)

  plugins.forEach(p => fn.use(p, options))

  if (options.toc) {
    fn.use(toc, options)
  }

  fn
    .use(toHast, options)
    .use(unnest, options)
    .use(jsx, options)

  const hast = fn
    .processSync(text)
    .contents

  return renderer(React)(hast, options)
}

export {
  md,
  Markdown
}
