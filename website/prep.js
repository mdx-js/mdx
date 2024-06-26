#!/usr/bin/env node
/**
 * @import {Root} from 'hast'
 */

/**
 * @typedef Redirect
 *   Redirect.
 * @property {string} destination
 *   To.
 * @property {string} source
 *   From.
 */

import fs from 'node:fs/promises'
import {fileURLToPath} from 'node:url'
import {globby} from 'globby'
import {h} from 'hastscript'
import pAll from 'p-all'
import rehypeMinifyUrl from 'rehype-minify-url'
import rehypePresetMinify from 'rehype-preset-minify'
import rehypeStringify from 'rehype-stringify'
import {unified} from 'unified'
import {VFile} from 'vfile'
import {config, redirect} from '../docs/_config.js'

await fs.mkdir(config.output, {recursive: true})

const from = new URL('_static/', config.input)
const files = await globby('**/*', {cwd: fileURLToPath(from)})

await pAll(
  files.map(function (d) {
    return async function () {
      return fs.copyFile(new URL(d, from), new URL(d, config.output))
    }
  }),
  {concurrency: 6}
)

console.log('✔ `/_static/*`')

await fs.writeFile(
  new URL('robots.txt', config.output),
  [
    'User-agent: *',
    'Allow: /',
    'Sitemap: ' + new URL('sitemap.xml', config.site),
    ''
  ].join('\n')
)

console.log('✔ `/robots.txt`')

await pAll(
  Object.keys(redirect).map(function (from) {
    return async function () {
      const to = redirect[from]
      const canonical = new URL(from + '/../', config.site).href
      const processor = unified()
        .use(rehypePresetMinify)
        .use(rehypeMinifyUrl, {from: canonical})
        .use(rehypeStringify)
      const file = new VFile({path: new URL('.' + from, config.output)})
      const tree = /** @type {Root} */ (
        await processor.run(buildRedirect(to), file)
      )
      file.value = processor.stringify(tree)
      if (file.dirname) await fs.mkdir(file.dirname, {recursive: true})
      await fs.writeFile(file.path, String(file))
    }
  }),
  {concurrency: 6}
)

console.log('✔ %d redirects', Object.keys(redirect).length)

// To do: drop Vercel.
/** @type {Array<Readonly<Redirect>>} */
const vercelRedirects = []
/** @type {string} */
let redirectFrom

for (redirectFrom in redirect) {
  if (Object.hasOwn(redirect, redirectFrom)) {
    const source = redirectFrom.replace(/\/index.html$/, '/')
    const destination = redirect[redirectFrom]
    vercelRedirects.push({destination, source})
  }
}

// To do: drop Vercel.
/** @type {Record<string, unknown> & {redirects: ReadonlyArray<Readonly<Redirect>>}} */
const vercelInfo = JSON.parse(String(await fs.readFile('vercel.json')))
await fs.writeFile(
  'vercel.json',
  JSON.stringify({...vercelInfo, redirects: vercelRedirects}, undefined, 2) +
    '\n'
)

console.log('✔ `vercel.json` redirects')

/**
 *
 * @param {string} to
 *   Redirect to.
 * @returns {Root}
 *   Tree.
 */
function buildRedirect(to) {
  const abs = new URL(to, config.site)
  return {
    type: 'root',
    children: [
      {type: 'doctype'},
      h('html', {lang: 'en'}, [
        h('head', [
          h('meta', {charSet: 'utf8'}),
          h('title', 'Redirecting…'),
          h('link', {href: String(abs), rel: 'canonical'}),
          h('script', 'location = ' + JSON.stringify(abs)),
          h('meta', {content: '0;url=' + abs, httpEquiv: 'refresh'}),
          h('meta', {content: 'noindex', name: 'robots'})
        ]),
        h('body', [
          h('h1', 'Redirecting…'),
          h('p', [
            h('a', {href: String(abs)}, 'Click here if you are not redirected.')
          ])
        ])
      ])
    ]
  }
}
