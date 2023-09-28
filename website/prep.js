#!/usr/bin/env node
import {promises as fs} from 'fs'
import {fileURLToPath} from 'url'
import pAll from 'p-all'
import {globby} from 'globby'
import {u} from 'unist-builder'
import {h} from 'hastscript'
import {VFile} from 'vfile'
import {unified} from 'unified'
import rehypePresetMinify from 'rehype-preset-minify'
import rehypeMinifyUrl from 'rehype-minify-url'
import rehypeStringify from 'rehype-stringify'
import {config, redirect} from '../docs/_config.js'

const own = {}.hasOwnProperty

main().catch((error) => {
  throw error
})

async function main() {
  await fs.mkdir(config.output, {recursive: true})

  const from = new URL('_static/', config.input)
  const files = await globby('**/*', {cwd: fileURLToPath(from)})

  await pAll(
    files.map(
      (d) => async () =>
        fs.copyFile(new URL(d, from), new URL(d, config.output))
    ),
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
    Object.keys(redirect).map((from) => async () => {
      const to = redirect[from]
      const canonical = new URL(from + '/../', config.site).href
      const processor = unified()
        .use(rehypePresetMinify)
        .use(rehypeMinifyUrl, {from: canonical})
        .use(rehypeStringify)
      const file = new VFile({path: new URL('.' + from, config.output)})
      const tree = await processor.run(buildRedirect(to), file)
      file.value = processor.stringify(tree)
      if (file.dirname) await fs.mkdir(file.dirname, {recursive: true})
      await fs.writeFile(file.path, String(file))
    }),
    {concurrency: 6}
  )

  console.log('✔ %d redirects', Object.keys(redirect).length)

  // To do: drop Vercel.
  const vercelRedirects = []
  let redirectFrom

  for (redirectFrom in redirect) {
    if (own.call(redirect, redirectFrom)) {
      const source = redirectFrom.replace(/\/index.html$/, '/')
      const destination = redirect[redirectFrom]
      vercelRedirects.push({source, destination})
    }
  }

  // To do: drop Vercel.
  const vercelInfo = JSON.parse(String(await fs.readFile('vercel.json')))
  await fs.writeFile(
    'vercel.json',
    JSON.stringify({...vercelInfo, redirects: vercelRedirects}, null, 2) + '\n'
  )

  console.log('✔ `vercel.json` redirects')
}

/**
 *
 * @param {string} to
 * @returns  {import('hast').Root}
 */
function buildRedirect(to) {
  const abs = new URL(to, config.site)
  return u('root', [
    // To do: remove `name`.
    u('doctype', {name: 'html'}),
    h('html', {lang: 'en'}, [
      h('head', [
        h('meta', {charSet: 'utf8'}),
        h('title', 'Redirecting…'),
        h('link', {rel: 'canonical', href: String(abs)}),
        h('script', 'location = ' + JSON.stringify(abs)),
        h('meta', {httpEquiv: 'refresh', content: '0;url=' + abs}),
        h('meta', {name: 'robots', content: 'noindex'})
      ]),
      h('body', [
        h('h1', 'Redirecting…'),
        h('p', [
          h('a', {href: String(abs)}, 'Click here if you are not redirected.')
        ])
      ])
    ])
  ])
}
