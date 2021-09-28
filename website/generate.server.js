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
import {toXml} from 'xast-util-to-xml'
import {Layout} from '../docs/_component/layout.server.js'
import {config} from '../docs/_config.js'

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

      const {default: Content, ...data} = await import(url.href)

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

  await pAll(
    allInfo.map((d) => async () => {
      const {name, data, Content, ghUrl, nljsonUrl, jsonUrl} = d

      await fs.mkdir(path.dirname(fileURLToPath(jsonUrl)), {recursive: true})
      await fs.writeFile(jsonUrl, JSON.stringify(data))
      const writeStream = defaultFs.createWriteStream(nljsonUrl)

      writeStream.on('close', () => console.log('  generate: `%s`', name))

      const element = React.createElement(Content, {
        components: {wrapper: Layout},
        ...data,
        name,
        ghUrl,
        navTree
      })

      pipeToNodeWritable(element, writeStream, manifest)
    }),
    {concurrency: 6}
  )

  process.on('exit', () => console.log('✔ Generate'))
}
