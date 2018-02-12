import React from 'react'
import unified from 'unified'
import parse from 'remark-parse'
import stringify from 'remark-stringify'
import toc from 'remark-toc'
import html from 'remark-html'
import slug from 'remark-slug'
import emoji from 'remark-emoji'
import squeeze from 'remark-squeeze-paragraphs'
import toHast from '@dumpster/remark-custom-element-to-hast'
import renderer from '@dumpster/hast-react-renderer'

import Markdown from './Markdown'
import ComponentsProvider from './Provider'
import relativize from './relativize'
import imports from './imports'
import images from './images'
import unnest from './unnest-custom-elements'

const parser = (text, options = {}) => {
  const plugins = options.plugins || []
  const components = options.components || {}

  options.componentWhitelist = Object.keys(components)

  if (!options.hasOwnProperty('unsafe')) {
    options.unsafe = true
  }

  const fn = unified()
    .use(parse)
    .use(stringify)
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

  return fn.processSync(text)
}

const md = (text, options = {}) => {
  const renderFn = options.render || React
  const hast = parser(text, options).contents

  return renderer(renderFn)(hast, options)
}

const metadata = (text, options = {}) => {
  const data = parser(text, options).data

  return Object.assign({}, data, {
    importScope: importScope(data.imports)
  })
}

const importScope = (imports = []) =>
  imports.reduce((acc, curr) => {
    const scopedImports = curr
      .parsed
      .reduce((a, c) => {
        const i = c.namedImports.map(n => n.value)
        if (c.defaultImport) i.push(c.defaultImport)
        if (c.starImport) i.push(c.starImport)

        return a.concat(i)
      }, [])

    return acc.concat(scopedImports)
  }, [])

export {
  md,
  metadata,
  Markdown,
  ComponentsProvider
}
