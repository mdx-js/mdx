#!/usr/bin/env node
import {promises as fs} from 'fs'
import {fileURLToPath} from 'url'
import {globby} from 'globby'
import {u} from 'unist-builder'
import {h} from 'hastscript'
import {VFile} from 'vfile'
import {unified} from 'unified'
import rehypePresetMinify from 'rehype-preset-minify'
import rehypeMinifyUrl from 'rehype-minify-url'
import rehypeStringify from 'rehype-stringify'
import {config, redirect} from '../docs/_config.js'

main().catch(error => {
  throw error
})

async function main() {
  await fs.mkdir(config.output, {recursive: true})

  const from = new URL('_static/', config.input)
  const files = await globby('**/*', {cwd: fileURLToPath(from)})

  await Promise.all(
    files.map(d => fs.copyFile(new URL(d, from), new URL(d, config.output)))
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

  await Promise.all(
    Object.keys(redirect).map(async from => {
      const to = redirect[from]
      const canonical = new URL(from + '/../', config.site).href
      const processor = unified()
        .use(rehypePresetMinify)
        .use(rehypeMinifyUrl, {from: canonical})
        .use(rehypeStringify)
      const file = new VFile({path: new URL('.' + from, config.output)})
      const tree = await processor.run(buildRedirect(to), file)
      file.value = processor.stringify(tree)
      await fs.mkdir(file.dirname, {recursive: true})
      await fs.writeFile(file.path, String(file))
      console.log('  redirect: `%s` -> `%s`', from, to)
    })
  )

  console.log('✔ Redirect')
}

function buildRedirect(to) {
  const abs = new URL(to, config.site)
  return u('root', [
    u('doctype'),
    h('html', {lang: 'en'}, [
      h('head', [
        h('meta', {charSet: 'utf8'}),
        h('title', 'Redirecting…'),
        h('link', {rel: 'canonical', href: abs}),
        h('script', 'location = ' + JSON.stringify(abs)),
        h('meta', {httpEquiv: 'refresh', content: '0;url=' + abs}),
        h('meta', {name: 'robots', content: 'noindex'})
      ]),
      h('body', [
        h('h1', 'Redirecting…'),
        h('p', [h('a', {href: abs}, 'Click here if you are not redirected.')])
      ])
    ])
  ])
}
