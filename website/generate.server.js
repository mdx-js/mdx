#!/usr/bin/env node
import defaultFs, {promises as fs} from 'fs'
import path from 'path'
import process from 'process'
import {fileURLToPath} from 'url'
import React from 'react'
import {pipeToNodeWritable} from 'react-server-dom-webpack/writer'
import pAll from 'p-all'
import {globby} from 'globby'
import {sitemap} from 'xast-util-sitemap'
import {unified} from 'unified'
import rehypeSanitize from 'rehype-sanitize'
import {toXml} from 'xast-util-to-xml'
import {Layout} from '../docs/_component/layout.server.js'
import {CopyButton} from '../docs/_component/copy.client.js'
import {config} from '../docs/_config.js'
import {schema} from './schema-description.js'

/** @type {{format(items: string[]): string}} */
// @ts-expect-error: TS doesn’t know about `ListFormat` yet.
const listFormat = new Intl.ListFormat('en')

main().catch((error) => {
  throw error
})

async function main() {
  const files = (
    await globby(['**/*.server.{md,mdx}', '!_component/*'], {
      cwd: fileURLToPath(config.input)
    })
  ).map((d) => new URL(d, config.input))

  const manifest = JSON.parse(
    await fs.readFile(new URL('react-client-manifest.json', config.output))
  )

  const allInfo = await pAll(
    files.map((url) => async () => {
      const name = url.href
        .slice(config.input.href.length - 1)
        .replace(/\.server\.mdx?$/, '/')
        .replace(/\/index\/$/, '/')
      const nljsonUrl = new URL('.' + name + 'index.nljson', config.output)
      const jsonUrl = new URL('.' + name + 'index.json', config.output)
      const ghUrl = new URL(
        url.href.slice(config.git.href.length),
        config.ghBlob
      )

      const {default: Content, info, ...data} = await import(url.href)
      // Handle `author` differently.
      const {author, ...restInfo} = info || {}
      const authors = Array.isArray(author) ? author : author ? [author] : []
      const authorNames = authors.map((d) => d.name)

      if (authors[0] && authors[0].twitter) {
        restInfo.authorTwitter = authors[0].twitter
      }

      const abbreviatedAuthors =
        authorNames.length > 3
          ? [...authorNames.slice(0, 2), 'others']
          : authorNames

      if (abbreviatedAuthors.length > 0) {
        restInfo.author = listFormat.format(abbreviatedAuthors)
      }

      data.meta = {authors, ...restInfo, ...data.meta}

      // Sanitize the HAST description:
      if (data.meta.descriptionHast) {
        data.meta.descriptionHast = unified()
          .use(rehypeSanitize, schema)
          .runSync(data.meta.descriptionHast)
      }

      return {name, url, ghUrl, nljsonUrl, jsonUrl, data, Content}
    }),
    {concurrency: 6}
  )

  const navTree = {name: '/', data: undefined, children: []}
  let index = -1

  while (++index < allInfo.length) {
    const {name, data} = allInfo[index]
    const parts = name.split('/').slice(0, -1)
    let partIndex = 0
    let context = navTree

    if (data.navExclude) continue

    while (++partIndex < parts.length) {
      const name = parts.slice(0, partIndex + 1).join('/') + '/'
      let contextItem = context.children.find((d) => d.name === name)

      if (!contextItem) {
        contextItem = {name, data: undefined, children: []}
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
        allInfo.map((d) => ({
          url: new URL(d.name, config.site),
          modified: d.data && d.data.meta && d.data.meta.modified,
          lang: 'en'
        }))
      )
    )
  )

  console.log('✔ `/sitemap.xml`')

  index = -1

  const {error} = console

  // Swallow some errors that react warns about for client components,
  // which are fine?!
  console.error = (...parameters) => {
    if (
      parameters[0] ===
        'Warning: React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s' &&
      parameters[1] === 'object' &&
      parameters[2] === ''
    ) {
      return
    }

    error(...parameters)
  }

  await pAll(
    allInfo.map((d) => async () => {
      const {name, data, Content, ghUrl, nljsonUrl, jsonUrl} = d

      await fs.mkdir(path.dirname(fileURLToPath(jsonUrl)), {recursive: true})
      await fs.writeFile(jsonUrl, JSON.stringify(data))
      const writeStream = defaultFs.createWriteStream(nljsonUrl)

      writeStream.on('close', () => console.log('  generate: `%s`', name))

      const element = React.createElement(Content, {
        components: {wrapper: Layout, CopyButton},
        ...data,
        name,
        ghUrl,
        navTree
      })

      pipeToNodeWritable(element, writeStream, manifest)
    }),
    {concurrency: 6}
  )

  process.on('exit', () => {
    console.error = error
    console.log('✔ Generate')
  })
}
