#!/usr/bin/env node
/**
 * @typedef {import('hast').Element} Element
 * @typedef {import('hast').Properties} Properties
 * @typedef {import('hast').Root} Root
 * @typedef {import('mdx/types.js').MDXContent} MDXContent
 * @typedef {Exclude<import('vfile').Data['meta'], undefined>} Meta
 * @typedef {Exclude<import('vfile').Data['matter'], undefined>} Matter
 * @typedef {import('../docs/_component/sort.js').Item} Item
 */

/**
 * @typedef Author
 *   Author.
 * @property {string | undefined} [github]
 *   GitHub handle (optional).
 * @property {string} name
 *   Name.
 * @property {string | undefined} [twitter]
 *   Twitter handle (optional).
 * @property {string | undefined} [url]
 *   URL (optional).
 *
 * @typedef Info
 *   Info.
 * @property {Array<Readonly<Author>> | Readonly<Author> | undefined} [author]
 *   Author(s) (optional);
 *   note: mutable because `isArray` casts to any.
 * @property {string | undefined} [authorTwitter]
 *   Primary twitter handle (optional).
 * @property {Date | undefined} [published]
 *   Published date (optional).
 * @property {Date | undefined} [modified]
 *   Modified date (optional).
 */

import assert from 'node:assert'
import fs from 'node:fs/promises'
import {fileURLToPath} from 'node:url'
import {globby} from 'globby'
import {h} from 'hastscript'
import {select} from 'hast-util-select'
import pAll from 'p-all'
import React from 'react'
import {renderToString} from 'react-dom/server'
import rehypeDocument from 'rehype-document'
import rehypeMeta from 'rehype-meta'
import rehypeMinifyUrl from 'rehype-minify-url'
import rehypeParse from 'rehype-parse'
import rehypePresetMinify from 'rehype-preset-minify'
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import {unified} from 'unified'
import {VFile} from 'vfile'
import {sitemap} from 'xast-util-sitemap'
import {toXml} from 'xast-util-to-xml'
import {Layout} from '../docs/_component/layout.jsx'
import {config} from '../docs/_config.js'
import {schema} from './schema-description.js'

const listFormat = new Intl.ListFormat('en')

const filePaths = await globby(['**/*.{md,mdx}', '!_component/*'], {
  cwd: fileURLToPath(config.input)
})
const files = filePaths.map(function (d) {
  return new URL(d, config.input)
})

const allInfo = await pAll(
  files.map(function (url) {
    return async function () {
      const name = url.href
        .slice(config.input.href.length - 1)
        .replace(/\.mdx?$/, '/')
        .replace(/\/index\/$/, '/')
      const jsonUrl = new URL('.' + name + 'index.json', config.output)
      const ghUrl = new URL(
        url.href.slice(config.git.href.length),
        config.ghBlob
      )

      /** @type {{default: MDXContent, info?: Info, matter: Matter, meta: Meta, navExclude?: boolean | undefined, navSortSelf?: number | undefined}} */
      const mod = await import(url.href)
      const {default: Content, info, ...data} = mod
      // Handle `author` differently.
      const {author, ...restInfo} = info || {}
      const authors = Array.isArray(author) ? author : author ? [author] : []
      const authorNames = authors.map(function (d) {
        return d.name
      })

      if (authors[0] && authors[0].twitter) {
        restInfo.authorTwitter = authors[0].twitter
      }

      const abbreviatedAuthors =
        authorNames.length > 3
          ? [...authorNames.slice(0, 2), 'others']
          : authorNames

      data.meta = {
        ...restInfo,
        author:
          abbreviatedAuthors.length > 0
            ? listFormat.format(abbreviatedAuthors)
            : undefined,
        ...data.meta,
        authors
      }

      // Sanitize the hast description:
      if (data.meta && data.meta.descriptionHast) {
        data.meta.descriptionHast = unified()
          .use(rehypeSanitize, schema)
          // @ts-expect-error: to do: use hast utils; element is fine.
          .runSync(data.meta.descriptionHast)
      }

      return {Content, data, ghUrl, jsonUrl, name, url}
    }
  }),
  {concurrency: 6}
)

/** @type {Item} */
const navTree = {name: '/', data: {}, children: []}
let index = -1

while (++index < allInfo.length) {
  const {data, name} = allInfo[index]
  const parts = name.split('/').slice(0, -1)
  let partIndex = 0
  let context = navTree

  if (data.navExclude) continue

  while (++partIndex < parts.length) {
    const name = parts.slice(0, partIndex + 1).join('/') + '/'
    let contextItem = context.children.find(function (d) {
      return d.name === name
    })

    if (!contextItem) {
      contextItem = {name, data: {}, children: []}
      context.children.push(contextItem)
    }

    context = contextItem
  }

  context.data = data
}

await fs.writeFile(
  new URL('sitemap.xml', config.output),
  toXml(
    sitemap(
      allInfo.map(function (d) {
        return {
          lang: 'en',
          modified: d.data && d.data.meta && d.data.meta.modified,
          url: new URL(d.name, config.site).href
        }
      })
    )
  )
)

console.log('✔ `/sitemap.xml`')

index = -1

await pAll(
  allInfo.map(function (d) {
    return async function () {
      const {Content, data, ghUrl, jsonUrl, name} = d

      await fs.mkdir(new URL('./', jsonUrl), {recursive: true})
      await fs.writeFile(jsonUrl, JSON.stringify(data))

      const element = React.createElement(Content, {
        ...data,
        components: {wrapper: Layout},
        ghUrl,
        name,
        navTree
      })

      const result = renderToString(element)

      const canonical = new URL(name, config.site)
      data.meta.origin = canonical.origin
      data.meta.pathname = canonical.pathname

      const file = await unified()
        .use(rehypeParse, {fragment: true})
        .use(rehypeDocument, {
          css: ['/index.css'],
          // To do: only include editor on playground?
          // Or use more editors.
          js: ['/index.js', '/editor.js'],
          language: 'en',
          link: [
            {
              href: new URL('rss.xml', config.site).href,
              rel: 'alternate',
              title: config.site.hostname,
              type: 'application/rss+xml'
            },
            {
              href: new URL('favicon.ico', config.site).href,
              rel: 'icon',
              sizes: 'any'
            },
            {
              href: new URL('icon.svg', config.site).href,
              rel: 'icon',
              type: 'image/svg+xml'
            }
          ],
          meta: [{content: 'mdx', name: 'generator'}]
        })
        .use(rehypeMeta, {
          color: config.color,
          copyright: true,
          image:
            name === '/'
              ? {
                  height: 1490,
                  url: new URL('og.png', config.site).href,
                  width: 3062
                }
              : {
                  height: 1256,
                  url:
                    name === '/blog/v2/' || name === '/migrating/v2/'
                      ? new URL('og-v2.png', config.site).href
                      : new URL('index.png', canonical).href,
                  width: 2400
                },
          name: config.title,
          og: true,
          ogNameInTitle: true,
          separator: ' | ',
          siteAuthor: config.author,
          siteTags: config.tags,
          siteTwitter: '@' + config.twitter.pathname.slice(1),
          twitter: true,
          type: 'article'
        })
        .use(rehypeLazyCss, [
          {href: 'https://esm.sh/@wooorm/starry-night@3/style/both.css'}
        ])
        .use(rehypePresetMinify)
        .use(rehypeMinifyUrl, {from: canonical.href})
        .use(rehypeStringify, {bogusComments: false})
        .process(
          new VFile({
            data,
            path: new URL('index.html', jsonUrl),
            value: result
          })
        )

      if (file.dirname) await fs.mkdir(file.dirname, {recursive: true})
      await fs.writeFile(file.path, String(file))
      console.log('  generate: `%s`', name)
    }
  }),
  {concurrency: 6}
)

console.log('✔ Generate')

/**
 * @param {ReadonlyArray<Readonly<Properties>>} styles
 *   Styles.
 * @returns
 *   Transform.
 */
function rehypeLazyCss(styles) {
  /**
   * @param {Root} tree
   *   Styles.
   * @returns {undefined}
   *   Nothing.
   */
  return function (tree) {
    const head = select('head', tree)
    assert(head)
    /** @type {Array<Element>} */
    const enabled = []
    /** @type {Array<Element>} */
    const disabled = []

    let index = -1
    while (++index < styles.length) {
      // To do: structured clone.
      const props = styles[index]
      enabled.push(
        h('link', {
          ...props,
          as: 'style',
          onLoad: "this.onload=undefined;this.rel='stylesheet'",
          rel: 'preload'
        })
      )
      disabled.push(h('link', {...props, rel: 'stylesheet'}))
    }

    head.children.push(...enabled)

    if (disabled.length > 0) {
      head.children.push(h('noscript', disabled))
    }
  }
}
