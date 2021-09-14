#!/usr/bin/env node
import {promises as fs} from 'fs'
import path from 'path'
import {fileURLToPath} from 'url'
import React from 'react'
import {renderToString} from 'react-dom/server.js'
import {createFromReadableStream} from 'react-server-dom-webpack'
import {globby} from 'globby'
import pAll from 'p-all'
import {VFile} from 'vfile'
import {unified} from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeDocument from 'rehype-document'
import rehypeMeta from 'rehype-meta'
import rehypePresetMinify from 'rehype-preset-minify'
import rehypeMinifyUrl from 'rehype-minify-url'
import rehypeRemoveComments from 'rehype-remove-comments'
import rehypeStringify from 'rehype-stringify'
import {Root} from '../docs/_asset/root.client.js'
import {config} from '../docs/_config.js'

main().catch(error => {
  throw error
})

async function main() {
  const manifest = JSON.parse(
    await fs.readFile(new URL('react-client-manifest.json', config.output))
  )

  // We have to fake webpack for SSR.
  // Luckily only a few parts of its API need to be faked.
  const cache = {}
  /* eslint-disable camelcase */
  global.__webpack_require__ = id => cache[id]
  global.__webpack_chunk_load__ = () => Promise.resolve()
  /* eslint-enable camelcase */

  // Populate the cache with all client modules.
  await Promise.all(
    Object.keys(manifest)
      .filter(d => path.basename(d) !== 'index.client.js')
      .map(async d => {
        cache[manifest[d]['*'].id] = await import(fileURLToPath(d))
      })
  )

  console.log('files:', await globby('**/index.nljson', {cwd: fileURLToPath(config.output)}));

  const files = (
    await globby('**/index.nljson', {cwd: fileURLToPath(config.output)})
  ).map(d => new URL(d, config.output))


  await pAll(
    files.map(url => async () => {
      const name = url.href
        .slice(config.output.href.length - 1)
        .replace(/\/index\.nljson$/, '/')
      const buf = await fs.readFile(url)

      const data = JSON.parse(
        await fs.readFile(new URL('.' + name + 'index.json', config.output))
      )
      // Create a browser stream that RSC needs for getting it’s content.
      const response = createFromReadableStream(asStream(buf))

      // Finally, actually perform the SSR, retrying if there is anything suspended.
      let result
      const now = Date.now()

      /* eslint-disable no-constant-condition */
      while (true) {
        result = renderToString(React.createElement(Root, {response}))
        if (!result.includes('<!--$!-->')) break
        /* eslint-disable no-await-in-loop */
        await sleep(48)
        if (new Date() > now + 5000) {
          throw new Error(
            'Cannot prerender `' +
              name +
              '` in less than 5 seconds, there’s probably an error earlier on (see bundle or generate)'
          )
        }
      }
      /* eslint-enable no-constant-condition */

      const canonical = new URL(name, config.site)
      data.meta.origin = canonical.origin
      data.meta.pathname = canonical.pathname

      const file = await unified()
        .use(rehypeParse, {fragment: true})
        .use(rehypeDocument, {
          language: 'en',
          css: ['/index.css'],
          link: [
            {
              rel: 'stylesheet',
              href: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.2.0/styles/github.min.css'
            },
            {
              rel: 'stylesheet',
              href: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.2.0/styles/github-dark.min.css',
              media: '(prefers-color-scheme: dark)'
            },
            {
              rel: 'alternate',
              type: 'application/rss+xml',
              title: config.site.hostname,
              href: new URL('rss.xml', config.site)
            }
          ],
          js: '/index.js',
          meta: [{name: 'generator', content: 'mdx + rsc'}]
        })
        .use(rehypeMeta, {
          twitter: true,
          og: true,
          copyright: true,
          type: 'article',
          name: config.title,
          siteTags: config.tags,
          siteAuthor: config.author,
          siteTwitter: '@' + config.twitter.pathname.slice(1),
          separator: ' | ',
          color: config.color,
          image:
            name === '/'
              ? {
                  url: new URL('og.png', config.site),
                  width: 3062,
                  height: 1490
                }
              : {
                  url: new URL('./index.png', canonical),
                  width: 2048,
                  height: 1170
                }
        })
        .use(rehypePresetMinify)
        .use(rehypeMinifyUrl, {from: canonical.href})
        // Hydration doesn’t work if these two are on:
        .use(rehypeRemoveComments, false)
        .use(rehypeStringify, {bogusComments: false})
        .process(
          new VFile({
            path: new URL('./index.html', url),
            value:
              '<div id=root>' +
              result +
              '</div><script id=payload data-src=' +
              new URL('./index.nljson', canonical).pathname +
              '></script>',
            data
          })
        )

      await fs.mkdir(file.dirname, {recursive: true})
      await fs.writeFile(file.path, String(file))
      console.log('  prerender: `%s`', name)
    }),
    {concurrency: 6}
  )

  console.log('✔ Prerender')
}

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

function asStream(buf) {
  return {
    getReader() {
      const enc = new TextEncoder()
      let done
      return {
        read() {
          if (done) return Promise.resolve({done})
          done = true
          return Promise.resolve({value: enc.encode(String(buf))})
        }
      }
    }
  }
}
