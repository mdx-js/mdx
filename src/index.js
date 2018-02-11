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

const parser = (text, options = {}) => {
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

  return fn.processSync(text)
}

const md = (text, options = {}) => {
  const renderFn = options.render || React
  const hast = parser(text, options).contents

  return renderer(renderFn)(hast, options)
}

const metadata = (text, options = {}) => parser(text, options).data
const importScope = (text, options = {}) =>
  metadata(text, options)
    .imports
    .reduce((acc, curr) => {
      const imports = curr
        .parsed
        .reduce((a, c) => {
          const i = c.namedImports.map(n => n.value)
          if (c.defaultImport) i.push(c.defaultImport)
          if (c.starImport) i.push(c.starImport)

          return a.concat(i)
        }, [])

      return acc.concat(imports)
    }, [])

export {
  md,
  importScope,
  metadata,
  Markdown
}
