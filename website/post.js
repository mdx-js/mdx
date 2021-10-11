import {promises as fs} from 'fs'
import {fileURLToPath} from 'url'
import pAll from 'p-all'
import {globby} from 'globby'
import {u} from 'unist-builder'
import {select} from 'hast-util-select'
import {h, s} from 'hastscript'
import {rss} from 'xast-util-feed'
import {toXml} from 'xast-util-to-xml'
import {VFile} from 'vfile'
import {unified} from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeSanitize, {defaultSchema} from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import captureWebsite from 'capture-website'
import chromium from 'chrome-aws-lambda'
import {config} from '../docs/_config.js'
import {schema} from './schema-description.js'

const dateTimeFormat = new Intl.DateTimeFormat('en', {dateStyle: 'long'})

main().catch((error) => {
  throw error
})

async function main() {
  fs.copyFile(
    new URL('404/index.html', config.output),
    new URL('404.html', config.output)
  )
  console.log('✔ `/404/index.html` -> `/404.html`')

  const css = await fs.readFile(
    new URL('../docs/_asset/index.css', import.meta.url),
    'utf8'
  )

  const files = (
    await globby('**/index.nljson', {cwd: fileURLToPath(config.output)})
  ).map((d) => new URL(d + '/../index.json', config.output))

  const allInfo = await Promise.all(
    files.map(async (url) => ({url, info: JSON.parse(await fs.readFile(url))}))
  )

  const entries = await pAll(
    [...allInfo]
      .filter((d) => d.info.meta.published !== undefined)
      .sort(
        (a, b) =>
          new Date(b.info.meta.published) - new Date(a.info.meta.published)
      )
      // Ten most recently published articles.
      .slice(0, 10)
      .map(({info, url}) => async () => {
        const buf = await fs.readFile(new URL('./index.html', url))
        const file = await unified()
          .use(rehypeParse)
          .use(() => (tree) => ({
            type: 'root',
            children: select('.body', tree).children
          }))
          .use(rehypeSanitize, {...defaultSchema, clobber: []})
          .use(rehypeStringify)
          .process(buf)

        return {
          title: info.meta.title,
          description: info.meta.description,
          descriptionHtml: file.value,
          author: info.meta.author,
          url: new URL(
            url.href.slice(config.output.href.length - 1) + '/../',
            config.site
          ).href,
          modified: info.meta.modified,
          published: info.meta.published
        }
      }),
    {concurrency: 6}
  )

  await fs.writeFile(
    new URL('rss.xml', config.output),
    toXml(
      rss(
        {
          title: config.title,
          description: 'MDX updates',
          tags: config.tags,
          author: config.author,
          url: config.site.href,
          lang: 'en',
          feedUrl: new URL('rss.xml', config.site).href
        },
        entries
      )
    ) + '\n'
  )

  console.log('✔ `/rss.xml`')

  await pAll(
    allInfo.map((data) => async () => {
      const {url, info} = data
      const output = new URL('./index.png', url)
      let stats

      try {
        stats = await fs.stat(output)
      } catch (error) {
        if (error.code !== 'ENOENT') throw error
      }

      // Don’t regenerate to improve performance.
      if (stats) return

      const processor = unified().use(rehypeStringify)
      const file = new VFile({path: url})
      const tree = await processor.run(
        u('root', [
          u('doctype'),
          h('html', {lang: 'en'}, [
            h('head', [
              h('meta', {charSet: 'utf8'}),
              h('title', 'Generated image'),
              h('style', css),
              h(
                'style',
                `
                  body {
                  }

                  .og-banner {
                    display: flex;
                    left: 0;
                    position: fixed;
                    right: 0;
                    top: 0;
                  }

                  .og-banner::before {
                    -webkit-backdrop-filter: saturate(200%) blur(1ex);
                    backdrop-filter: saturate(200%) blur(1ex);
                    background-image: radial-gradient(ellipse at 50% 0,#ab7003 0,transparent 150%);
                    bottom: 0;
                    content: "";
                    left: 0;
                    position: absolute;
                    right: 0;
                    top: 0;
                    z-index: -1;
                  }

                  .og-icon {
                    display: block;
                    height: calc(1em + 1ex);
                    vertical-align: middle;
                    width: auto;
                    margin: calc(1em + 1ex);
                    margin-left: calc(2 * (1em + 1ex))
                  }

                  .og-root {
                    height: 100vh;
                    display: flex;
                    justify-content: center;
                    flex-flow: column;
                    padding: calc(2 * (1em + 1ex));
                    padding-top: calc(5 * (1em + 1ex));
                  }

                  .og-title {
                    margin: 0;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    flex-shrink: 0;
                  }

                  .og-description {
                    flex-grow: 1;
                    overflow: hidden;
                  }

                  .og-meta {
                    flex-shrink: 0;
                    margin-top: calc(1em + 1ex);
                    display: flex;
                    justify-content: space-between;
                  }

                  .og-right {
                    margin-left: auto;
                    text-align: right;
                  }
              `
              )
            ]),
            h('body', [
              h('.og-banner', [
                s(
                  'svg.og-icon.og-icon-mdx',
                  {height: 28.5, width: 69, viewBox: '0 0 138 57'},
                  [
                    s('rect', {
                      fill: 'var(--fg)',
                      height: 55.5,
                      rx: 4.5,
                      width: 136.5,
                      x: 0.75,
                      y: 0.75
                    }),
                    s(
                      'g',
                      {fill: 'none', stroke: 'var(--bg)', strokeWidth: 6},
                      [
                        s('path', {
                          d: 'M16.5 44V19L30.25 32.75l14-14v25'
                        }),
                        s('path', {d: 'M70.5 40V10.75'}),
                        s('path', {d: 'M57 27.25L70.5 40.75l13.5-13.5'}),
                        s('path', {
                          d: 'M122.5 41.24L93.25 12M93.5 41.25L122.75 12',
                          stroke: '#fcb32c'
                        })
                      ]
                    )
                  ]
                )
              ]),
              h('.og-root', [
                h('h2.og-title', info.meta.title),
                h('.og-description', [
                  info.meta.descriptionHast
                    ? unified()
                        .use(rehypeSanitize, schema)
                        .runSync(info.meta.descriptionHast)
                    : info.meta.description || info.matter.description
                ]),
                h('.og-meta', [
                  h('.og-left', [
                    h('small', 'By'),
                    h('br'),
                    h('b', info.meta.author || 'MDX contributors')
                  ]),
                  info.meta.modified
                    ? h('.og-right', [
                        h('small', 'Last modified on'),
                        h('br'),
                        h(
                          'b',
                          dateTimeFormat.format(new Date(info.meta.modified))
                        )
                      ])
                    : undefined
                ])
              ])
            ])
          ])
        ]),
        file
      )

      file.value = processor.stringify(tree)

      try {
        await fs.unlink(output)
      } catch {}

      await captureWebsite.file(file.value, output, {
        launchOptions: {
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath: await chromium.executablePath
        },
        inputType: 'html',
        // This is doubled in the actual file dimensions.
        width: 1024,
        height: 585,
        darkMode: true
      })

      console.log('OG image `%s`', info.meta.title)
    }),
    {concurrency: 6}
  )

  console.log('✔ OG images')
}
