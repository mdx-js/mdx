/**
 * @typedef {import('react').FC} FC
 * @typedef {import('esbuild').BuildFailure} BuildFailure
 * @typedef {import('esbuild').Message} Message
 * @typedef {import('hast').Root} Root
 * @typedef {import('vfile').VFile} VFile
 */

import {promises as fs} from 'fs'
import {URL, fileURLToPath} from 'url'
import {test} from 'uvu'
import * as assert from 'uvu/assert'
import esbuild from 'esbuild'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server.js'
import esbuildMdx from '../index.js'

test('@mdx-js/esbuild', async () => {
  // MDX.
  await fs.writeFile(
    new URL('./esbuild.mdx', import.meta.url),
    'export const Message = () => <>World!</>\n\n# Hello, <Message />'
  )

  await esbuild.build({
    bundle: true,
    define: {'process.env.NODE_ENV': '"development"'},
    entryPoints: [fileURLToPath(new URL('./esbuild.mdx', import.meta.url))],
    outfile: fileURLToPath(new URL('./esbuild.js', import.meta.url)),
    format: 'esm',
    plugins: [esbuildMdx()]
  })

  /** @type {FC} */
  let Content =
    /* @ts-expect-error file is dynamically generated */
    (await import('./esbuild.js')).default // type-coverage:ignore-line

  assert.equal(
    renderToStaticMarkup(React.createElement(Content)),
    '<h1>Hello, World!</h1>',
    'should compile'
  )

  await fs.unlink(new URL('./esbuild.mdx', import.meta.url))
  await fs.unlink(new URL('./esbuild.js', import.meta.url))

  // Markdown.
  await fs.writeFile(new URL('./esbuild.md', import.meta.url), '\ta')

  await esbuild.build({
    bundle: true,
    define: {'process.env.NODE_ENV': '"development"'},
    entryPoints: [fileURLToPath(new URL('./esbuild.md', import.meta.url))],
    outfile: fileURLToPath(new URL('./esbuild-md.js', import.meta.url)),
    format: 'esm',
    plugins: [esbuildMdx()]
  })

  Content =
    /* @ts-expect-error file is dynamically generated */
    (await import('./esbuild-md.js')).default // type-coverage:ignore-line

  assert.equal(
    renderToStaticMarkup(React.createElement(Content)),
    '<pre><code>a\n</code></pre>',
    'should compile `.md`'
  )

  await fs.unlink(new URL('./esbuild.md', import.meta.url))
  await fs.unlink(new URL('./esbuild-md.js', import.meta.url))

  // `.md` as MDX extension.
  await fs.writeFile(new URL('./esbuild.md', import.meta.url), '\ta')

  await esbuild.build({
    bundle: true,
    define: {'process.env.NODE_ENV': '"development"'},
    entryPoints: [fileURLToPath(new URL('./esbuild.md', import.meta.url))],
    outfile: fileURLToPath(new URL('./esbuild-md-as-mdx.js', import.meta.url)),
    format: 'esm',
    plugins: [esbuildMdx({mdExtensions: [], mdxExtensions: ['.md']})]
  })

  Content =
    /* @ts-expect-error file is dynamically generated */
    (await import('./esbuild-md-as-mdx.js')).default // type-coverage:ignore-line

  assert.equal(
    renderToStaticMarkup(React.createElement(Content)),
    '<p>a</p>',
    'should compile `.md` as MDX w/ configuration'
  )

  await fs.unlink(new URL('./esbuild.md', import.meta.url))
  await fs.unlink(new URL('./esbuild-md-as-mdx.js', import.meta.url))

  // File not in `extnames`:
  await fs.writeFile(new URL('./esbuild.md', import.meta.url), 'a')
  await fs.writeFile(new URL('./esbuild.mdx', import.meta.url), 'a')

  console.log('\nnote: the following error is expected!\n')
  try {
    await esbuild.build({
      entryPoints: [fileURLToPath(new URL('./esbuild.md', import.meta.url))],
      outfile: fileURLToPath(
        new URL('./esbuild-md-as-mdx.js', import.meta.url)
      ),
      plugins: [esbuildMdx({format: 'mdx'})]
    })
    assert.unreachable()
  } catch (error) {
    assert.match(
      String(error),
      /No loader is configured for "\.md" files/,
      'should not handle `.md` files w/ `format: mdx`'
    )
  }

  console.log('\nnote: the following error is expected!\n')
  try {
    await esbuild.build({
      entryPoints: [fileURLToPath(new URL('./esbuild.mdx', import.meta.url))],
      outfile: fileURLToPath(
        new URL('./esbuild-md-as-mdx.js', import.meta.url)
      ),
      plugins: [esbuildMdx({format: 'md'})]
    })
    assert.unreachable()
  } catch (error) {
    assert.match(
      String(error),
      /No loader is configured for "\.mdx" files/,
      'should not handle `.mdx` files w/ `format: md`'
    )
  }

  await fs.unlink(new URL('./esbuild.md', import.meta.url))
  await fs.unlink(new URL('./esbuild.mdx', import.meta.url))

  console.log('\nnote: the following errors and warnings are expected!\n')

  await fs.writeFile(
    new URL('./esbuild-broken.mdx', import.meta.url),
    'asd <https://example.com>?'
  )

  try {
    await esbuild.build({
      entryPoints: [
        fileURLToPath(new URL('./esbuild-broken.mdx', import.meta.url))
      ],
      outfile: fileURLToPath(new URL('./esbuild.js', import.meta.url)),
      plugins: [esbuildMdx()]
    })
    assert.unreachable('esbuild should throw')
  } catch (error) {
    const exception = /** @type {BuildFailure} */ (error)
    const message = exception.errors[0]
    delete message.detail
    assert.equal(
      message,
      {
        location: {
          column: 11,
          file: 'test/esbuild-broken.mdx',
          length: 1,
          line: 1,
          lineText: 'asd <https://example.com>?',
          namespace: 'file',
          suggestion: ''
        },
        notes: [],
        pluginName: 'esbuild-xdm',
        text: 'Unexpected character `/` (U+002F) before local name, expected a character that can start a name, such as a letter, `$`, or `_` (note: to create a link in MDX, use `[text](url)`)'
      },
      'should pass errors'
    )
  }

  await fs.unlink(new URL('./esbuild-broken.mdx', import.meta.url))

  await fs.writeFile(
    new URL('./esbuild-warnings.mdx', import.meta.url),
    'export const Message = () => <>World!</>\n\n# Hello, <Message />'
  )

  try {
    await esbuild.build({
      entryPoints: [
        fileURLToPath(new URL('./esbuild-warnings.mdx', import.meta.url))
      ],
      outfile: fileURLToPath(new URL('./esbuild-warnings.js', import.meta.url)),
      format: 'esm',
      plugins: [
        esbuildMdx({
          rehypePlugins: [
            () =>
              /**
               * @param {Root} tree
               * @param {VFile} file
               */
              (tree, file) => {
                file.message('1')
                file.message('2', tree.children[1]) // EOL between both, no position.
                file.message('3', tree)
                file.message('4', tree.children[0]) // Export
                // @ts-expect-error: fine.
                file.message('5', tree.children[2].children[0]) // Text in heading
                // @ts-expect-error: fine.
                file.message('6', tree.children[2].children[1]) // Expression in heading
                // @ts-expect-error: fine.
                file.message('7', tree.children[2].position.end).fatal = true // End of heading
              }
          ]
        })
      ]
    })
    assert.unreachable('esbuild should throw')
  } catch (error) {
    /** @type {BuildFailure} */
    const result = JSON.parse(JSON.stringify(error))

    for (const message of [...result.errors, ...result.warnings]) {
      delete message.detail
    }

    assert.equal(
      result,
      {
        errors: [
          {
            location: {
              column: 20,
              file: 'test/esbuild-warnings.mdx',
              length: 1,
              line: 3,
              lineText: '# Hello, <Message />',
              namespace: 'file',
              suggestion: ''
            },
            notes: [],
            pluginName: 'esbuild-xdm',
            text: '7'
          }
        ],
        warnings: [
          {
            location: {
              column: 0,
              file: 'test/esbuild-warnings.mdx',
              length: 0,
              line: 0,
              lineText: 'export const Message = () => <>World!</>',
              namespace: 'file',
              suggestion: ''
            },
            notes: [],
            pluginName: 'esbuild-xdm',
            text: '1'
          },
          {
            location: {
              column: 0,
              file: 'test/esbuild-warnings.mdx',
              length: 0,
              line: 0,
              lineText: 'export const Message = () => <>World!</>',
              namespace: 'file',
              suggestion: ''
            },
            notes: [],
            pluginName: 'esbuild-xdm',
            text: '2'
          },
          {
            location: {
              column: 0,
              file: 'test/esbuild-warnings.mdx',
              length: 40,
              line: 1,
              lineText: 'export const Message = () => <>World!</>',
              namespace: 'file',
              suggestion: ''
            },
            notes: [],
            pluginName: 'esbuild-xdm',
            text: '3'
          },
          {
            location: {
              column: 0,
              file: 'test/esbuild-warnings.mdx',
              length: 40,
              line: 1,
              lineText: 'export const Message = () => <>World!</>',
              namespace: 'file',
              suggestion: ''
            },
            notes: [],
            pluginName: 'esbuild-xdm',
            text: '4'
          },
          {
            location: {
              column: 2,
              file: 'test/esbuild-warnings.mdx',
              length: 7,
              line: 3,
              lineText: '# Hello, <Message />',
              namespace: 'file',
              suggestion: ''
            },
            notes: [],
            pluginName: 'esbuild-xdm',
            text: '5'
          },
          {
            location: {
              column: 9,
              file: 'test/esbuild-warnings.mdx',
              length: 11,
              line: 3,
              lineText: '# Hello, <Message />',
              namespace: 'file',
              suggestion: ''
            },
            notes: [],
            pluginName: 'esbuild-xdm',
            text: '6'
          }
        ]
      },
      'should pass warnings'
    )
  }

  await fs.unlink(new URL('./esbuild-warnings.mdx', import.meta.url))

  console.log('\nnote: the preceding errors and warnings are expected!\n')

  /** @type {(contents: string) => import('esbuild').Plugin} */
  const inlinePlugin = (contents) => ({
    name: 'inline plugin',
    setup: (build) => {
      build.onResolve({filter: /esbuild\.mdx/}, () => ({
        path: fileURLToPath(new URL('./esbuild.mdx', import.meta.url)),
        pluginData: {contents}
      }))
    }
  })

  await esbuild.build({
    entryPoints: [fileURLToPath(new URL('./esbuild.mdx', import.meta.url))],
    outfile: fileURLToPath(
      new URL('./esbuild-compile-from-memory.js', import.meta.url)
    ),
    plugins: [inlinePlugin(`# Test`), esbuildMdx()],
    define: {'process.env.NODE_ENV': '"development"'},
    format: 'esm',
    bundle: true
  })

  Content =
    /** @ts-expect-error file is dynamically generated */
    (await import('./esbuild-compile-from-memory.js')).default // type-coverage:ignore-line

  assert.equal(
    renderToStaticMarkup(React.createElement(Content)),
    '<h1>Test</h1>',
    'should compile from `pluginData.content`'
  )

  await fs.unlink(new URL('./esbuild-compile-from-memory.js', import.meta.url))

  await esbuild.build({
    entryPoints: [fileURLToPath(new URL('./esbuild.mdx', import.meta.url))],
    outfile: fileURLToPath(
      new URL('./esbuild-compile-from-memory-empty.js', import.meta.url)
    ),
    plugins: [inlinePlugin(``), esbuildMdx()],
    define: {'process.env.NODE_ENV': '"development"'},
    format: 'esm',
    bundle: true
  })

  Content =
    /** @ts-expect-error file is dynamically generated */
    (await import('./esbuild-compile-from-memory-empty.js')).default // type-coverage:ignore-line

  assert.equal(
    renderToStaticMarkup(React.createElement(Content)),
    '',
    'should compile from `pluginData.content` when an empty string is passed'
  )

  await fs.unlink(
    new URL('./esbuild-compile-from-memory-empty.js', import.meta.url)
  )

  // Remote markdown.
  await fs.writeFile(
    new URL('./esbuild-with-remote-md.mdx', import.meta.url),
    'import Content from "https://raw.githubusercontent.com/wooorm/xdm/main/test/files/md-file.md"\n\n<Content />'
  )

  await esbuild.build({
    entryPoints: [
      fileURLToPath(new URL('./esbuild-with-remote-md.mdx', import.meta.url))
    ],
    outfile: fileURLToPath(
      new URL('./esbuild-with-remote-md.js', import.meta.url)
    ),
    bundle: true,
    define: {'process.env.NODE_ENV': '"development"'},
    format: 'esm',
    plugins: [esbuildMdx({allowDangerousRemoteMdx: true})]
  })

  Content =
    /* @ts-expect-error file is dynamically generated */
    (await import('./esbuild-with-remote-md.js')).default // type-coverage:ignore-line

  assert.equal(
    renderToStaticMarkup(React.createElement(Content)),
    '<p>Some content.</p>',
    'should compile remote markdown files w/ `allowDangerousRemoteMdx`'
  )

  await fs.unlink(new URL('./esbuild-with-remote-md.mdx', import.meta.url))
  await fs.unlink(new URL('./esbuild-with-remote-md.js', import.meta.url))

  // Remote MDX importing more markdown.
  await fs.writeFile(
    new URL('./esbuild-with-remote-mdx.mdx', import.meta.url),
    'import Content from "https://raw.githubusercontent.com/wooorm/xdm/main/test/files/mdx-file-importing-markdown.mdx"\n\n<Content />'
  )

  await esbuild.build({
    entryPoints: [
      fileURLToPath(new URL('./esbuild-with-remote-mdx.mdx', import.meta.url))
    ],
    outfile: fileURLToPath(
      new URL('./esbuild-with-remote-mdx.js', import.meta.url)
    ),
    bundle: true,
    define: {'process.env.NODE_ENV': '"development"'},
    format: 'esm',
    plugins: [esbuildMdx({allowDangerousRemoteMdx: true})]
  })

  Content =
    /* @ts-expect-error file is dynamically generated */
    (await import('./esbuild-with-remote-mdx.js')).default // type-coverage:ignore-line

  assert.equal(
    renderToStaticMarkup(React.createElement(Content)),
    '<h1>heading</h1>\n<p>A <span style="color:red">little pill</span>.</p>\n<p>Some content.</p>',
    'should compile remote MD, MDX, and JS files w/ `allowDangerousRemoteMdx`'
  )

  await fs.unlink(new URL('./esbuild-with-remote-mdx.mdx', import.meta.url))
  await fs.unlink(new URL('./esbuild-with-remote-mdx.js', import.meta.url))
})

test.run()
