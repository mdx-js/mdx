/**
 * @import {Stats} from 'node:fs'
 * @import {DataMapMatter, DataMapMeta} from 'vfile'
 * @import {Entry} from 'xast-util-feed'
 */

/**
 * @typedef Info
 *   Info.
 * @property {Readonly<DataMapMeta>} meta
 *   Meta.
 * @property {Readonly<DataMapMatter>} matter
 *   Matter.
 * @property {boolean | undefined} [navExclude=false]
 *   Whether to exclude from the navigation (default: `false`).
 * @property {number | undefined} [navSortSelf=0]
 *   Self sort order (default: `0`).
 */

import assert from 'node:assert'
import fs from 'node:fs/promises'
import process from 'node:process'
import {fileURLToPath} from 'node:url'
import chromium from '@sparticuz/chromium'
import {globby} from 'globby'
import {fromHtml} from 'hast-util-from-html'
import {sanitize, defaultSchema} from 'hast-util-sanitize'
import {select} from 'hast-util-select'
import {toHtml} from 'hast-util-to-html'
import {h, s} from 'hastscript'
import pAll from 'p-all'
import puppeteer from 'puppeteer'
import {rss} from 'xast-util-feed'
import {toXml} from 'xast-util-to-xml'
import {config} from '../docs/_config.js'
import {schema} from './schema-description.js'

const dateTimeFormat = new Intl.DateTimeFormat('en', {dateStyle: 'long'})

fs.copyFile(
  new URL('404/index.html', config.output),
  new URL('404.html', config.output)
)
console.log('✔ `/404/index.html` -> `/404.html`')

const css = await fs.readFile(
  new URL('../docs/_asset/index.css', import.meta.url),
  'utf8'
)

const filePaths = await globby('**/index.json', {
  cwd: fileURLToPath(config.output)
})
const files = filePaths.map(function (d) {
  return new URL(d, config.output)
})

const allInfo = await Promise.all(
  files.map(async function (url) {
    /** @type {Info} */
    const info = JSON.parse(String(await fs.readFile(url)))
    return {info, url}
  })
)

// RSS feed.
const now = new Date()

const entries = await pAll(
  [...allInfo]
    // All blog entries that are published in the past.
    .filter(function (d) {
      return (
        d.info.meta.pathname &&
        d.info.meta.pathname.startsWith('/blog/') &&
        d.info.meta.pathname !== '/blog/' &&
        d.info.meta.published !== null &&
        d.info.meta.published !== undefined &&
        new Date(d.info.meta.published) < now
      )
    })
    // Sort.
    .sort(function (a, b) {
      assert(a.info.meta.published)
      assert(b.info.meta.published)
      return (
        new Date(b.info.meta.published).valueOf() -
        new Date(a.info.meta.published).valueOf()
      )
    })
    // Ten most recently published articles.
    .slice(0, 10)
    .map(function ({info, url}) {
      /**
       * @returns {Promise<Entry>}
       *   Entry.
       */
      return async function () {
        const buf = await fs.readFile(new URL('index.html', url))
        const tree = fromHtml(buf)
        const body = select('.body', tree)
        assert(body)
        const clean = sanitize(body, {
          ...defaultSchema,
          attributes: {
            ...defaultSchema.attributes,
            code: [
              [
                'className',
                'language-diff',
                'language-html',
                'language-js',
                'language-jsx',
                'language-md',
                'language-mdx',
                'language-sh',
                'language-ts'
              ]
            ]
          },
          clobber: []
        })

        return {
          author: info.meta.author,
          description: info.meta.description,
          descriptionHtml: toHtml(clean),
          modified: info.meta.modified,
          published: info.meta.published,
          title: info.meta.title,
          url: new URL(
            url.href.slice(config.output.href.length - 1) + '/../',
            config.site
          ).href
        }
      }
    }),
  {concurrency: 6}
)

await fs.writeFile(
  new URL('rss.xml', config.output),
  toXml(
    rss(
      {
        author: config.author,
        description: 'MDX updates',
        feedUrl: new URL('rss.xml', config.site).href,
        lang: 'en',
        tags: config.tags,
        title: config.title,
        url: config.site.href
      },
      entries
    )
  ) + '\n'
)

console.log('✔ `/rss.xml`')

await fs.writeFile(new URL('CNAME', config.output), config.site.host + '\n')

console.log('✔ `/CNAME`')

chromium.setGraphicsMode = false

const browser = await puppeteer.launch(
  process.env.AWS_EXECUTION_ENV
    ? {
        // See: <https://github.com/Sparticuz/chromium/issues/85#issuecomment-1527692751>
        args: [...chromium.args, '--disable-gpu'],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: true
      }
    : {headless: true}
)

await pAll(
  allInfo.map(function (data) {
    return async function () {
      const {url, info} = data
      const output = new URL('index.png', url)
      /** @type {Stats | undefined} */
      let stats

      try {
        stats = await fs.stat(output)
      } catch (error) {
        const cause = /** @type {NodeJS.ErrnoException} */ (error)
        if (cause.code !== 'ENOENT') throw cause
      }

      // Don’t regenerate to improve performance.
      if (stats) return

      const value = toHtml({
        type: 'root',
        children: [
          {type: 'doctype'},
          h('html', {lang: 'en'}, [
            h('head', [
              h('meta', {charSet: 'utf8'}),
              h('title', 'Generated image'),
              h('style', css),
              h(
                'style',
                `
                html {
                  font-size: 24px;
                }

                body {
                  /* yellow */
                  background-image: radial-gradient(
                      ellipse at 0% 0%,
                      rgb(252 180 45 / 15%) 20%,
                      rgb(252 180 45 / 0%) 80%
                    ),
                    /* purple */
                      radial-gradient(
                        ellipse at 0% 100%,
                        rgb(130 80 223 / 15%) 20%,
                        rgb(130 80 223 / 0%) 80%
                      );
                }

                .og-root {
                  height: calc(100vh - calc(2 * (1em + 1ex)));
                  display: flex;
                  flex-flow: column;
                  margin-block: calc(1 * (1em + 1ex));
                  padding-block: calc(1 * (1em + 1ex));
                  padding-inline: calc(1 * (1em + 1ex));
                  background-color: var(--bg);
                }

                .og-head {
                  margin-block-end: calc(2 * (1em + 1ex));
                }

                .og-icon {
                  display: block;
                  height: calc(1em + 1ex);
                  width: auto;
                  vertical-align: middle;
                }

                .og-title {
                  font-size: 3rem;
                  line-height: calc(1em + (1 / 3 * 1ex));
                  margin-block: 0;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                  flex-shrink: 0;
                }

                .og-description {
                  flex-grow: 1;
                  overflow: hidden;
                }

                .og-description-inside {
                  -webkit-line-clamp: 2;
                  -webkit-box-orient: vertical;
                  display: -webkit-box;
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
              h('.og-root', [
                h('.og-head', [
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
                            d: 'M122.5 41.24L93.25 12M93.5 41.25L122.75 12'
                          })
                        ]
                      )
                    ]
                  )
                ]),
                h('h2.og-title', info.meta.title),
                h('.og-description', [
                  h('.og-description-inside', [
                    info.meta.descriptionHast
                      ? sanitize(info.meta.descriptionHast, schema)
                      : info.meta.description || info.matter.description
                  ])
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
        ]
      })

      try {
        await fs.unlink(output)
      } catch {}

      const page = await browser.newPage()
      // This is doubled in the actual file dimensions.
      await page.setViewport({deviceScaleFactor: 2, height: 628, width: 1200})
      await page.emulateMediaFeatures([
        {name: 'prefers-color-scheme', value: 'light'}
      ])
      await page.setContent(value)
      const screenshot = await page.screenshot()
      await page.close()

      await fs.writeFile(output, screenshot)

      console.log('OG image `%s`', info.meta.title)
    }
  }),
  {concurrency: 4}
)

await browser.close()

console.log('✔ OG images')
