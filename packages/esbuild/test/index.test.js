/**
 * @typedef {import('esbuild').BuildFailure} BuildFailure
 * @typedef {import('esbuild').Message} Message
 * @typedef {import('hast').Root} Root
 * @typedef {import('vfile').VFile} VFile
 * @typedef {import('mdx/types.js').MDXContent} MDXContent
 *
 * @typedef {import('remark-mdx')}
 */

import {promises as fs} from 'fs'
import {fileURLToPath} from 'url'
import {test} from 'uvu'
import * as assert from 'uvu/assert'
import esbuild from 'esbuild'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import esbuildMdx from '../index.js'

test('@mdx-js/esbuild', async () => {
  // MDX.
  await fs.writeFile(
    new URL('esbuild.mdx', import.meta.url),
    'export const Message = () => <>World!</>\n\n# Hello, <Message />'
  )

  await esbuild.build({
    bundle: true,
    define: {'process.env.NODE_ENV': '"development"'},
    entryPoints: [fileURLToPath(new URL('esbuild.mdx', import.meta.url))],
    outfile: fileURLToPath(new URL('esbuild.js', import.meta.url)),
    format: 'esm',
    plugins: [esbuildMdx()]
  })

  /** @type {MDXContent} */
  let Content =
    /* @ts-expect-error file is dynamically generated */
    (await import('./esbuild.js')).default // type-coverage:ignore-line

  assert.equal(
    renderToStaticMarkup(React.createElement(Content)),
    '<h1>Hello, World!</h1>',
    'should compile'
  )

  await fs.unlink(new URL('esbuild.mdx', import.meta.url))
  await fs.unlink(new URL('esbuild.js', import.meta.url))

  // Resolve directory.
  await fs.writeFile(
    new URL('esbuild-resolve.mdx', import.meta.url),
    'import Content from "./folder/file.mdx"\n\n<Content/>'
  )
  await fs.mkdir(new URL('folder', import.meta.url))
  await fs.writeFile(
    new URL('folder/file.mdx', import.meta.url),
    'import {data} from "./file.js"\n\n{data}'
  )
  await fs.writeFile(
    new URL('folder/file.js', import.meta.url),
    'export const data = 0.1'
  )
  await esbuild.build({
    bundle: true,
    define: {'process.env.NODE_ENV': '"development"'},
    entryPoints: [
      fileURLToPath(new URL('esbuild-resolve.mdx', import.meta.url))
    ],
    outfile: fileURLToPath(new URL('esbuild-resolve.js', import.meta.url)),
    format: 'esm',
    plugins: [esbuildMdx()]
  })
  /** @type {MDXContent} */
  Content =
    /* @ts-expect-error file is dynamically generated */
    (await import('./esbuild-resolve.js')).default // type-coverage:ignore-line

  assert.equal(
    renderToStaticMarkup(React.createElement(Content)),
    '0.1',
    'should compile'
  )

  await fs.unlink(new URL('esbuild-resolve.mdx', import.meta.url))
  await fs.unlink(new URL('esbuild-resolve.js', import.meta.url))
  await fs.rmdir(new URL('folder/', import.meta.url), {recursive: true})

  // Markdown.
  await fs.writeFile(new URL('esbuild.md', import.meta.url), '\ta')

  await esbuild.build({
    bundle: true,
    define: {'process.env.NODE_ENV': '"development"'},
    entryPoints: [fileURLToPath(new URL('esbuild.md', import.meta.url))],
    outfile: fileURLToPath(new URL('esbuild-md.js', import.meta.url)),
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

  await fs.unlink(new URL('esbuild.md', import.meta.url))
  await fs.unlink(new URL('esbuild-md.js', import.meta.url))

  // `.md` as MDX extension.
  await fs.writeFile(new URL('esbuild.md', import.meta.url), '\ta')

  await esbuild.build({
    bundle: true,
    define: {'process.env.NODE_ENV': '"development"'},
    entryPoints: [fileURLToPath(new URL('esbuild.md', import.meta.url))],
    outfile: fileURLToPath(new URL('esbuild-md-as-mdx.js', import.meta.url)),
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

  await fs.unlink(new URL('esbuild.md', import.meta.url))
  await fs.unlink(new URL('esbuild-md-as-mdx.js', import.meta.url))

  // File not in `extnames`:
  await fs.writeFile(new URL('esbuild.md', import.meta.url), 'a')
  await fs.writeFile(new URL('esbuild.mdx', import.meta.url), 'a')

  console.log('\nnote: the following error is expected!\n')
  try {
    await esbuild.build({
      entryPoints: [fileURLToPath(new URL('esbuild.md', import.meta.url))],
      outfile: fileURLToPath(new URL('esbuild-md-as-mdx.js', import.meta.url)),
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
      entryPoints: [fileURLToPath(new URL('esbuild.mdx', import.meta.url))],
      outfile: fileURLToPath(new URL('esbuild-md-as-mdx.js', import.meta.url)),
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

  await fs.unlink(new URL('esbuild.md', import.meta.url))
  await fs.unlink(new URL('esbuild.mdx', import.meta.url))

  console.log('\nnote: the following errors and warnings are expected!\n')

  await fs.writeFile(
    new URL('esbuild-broken.mdx', import.meta.url),
    'asd <https://example.com>?'
  )

  try {
    await esbuild.build({
      entryPoints: [
        fileURLToPath(new URL('esbuild-broken.mdx', import.meta.url))
      ],
      outfile: fileURLToPath(new URL('esbuild.js', import.meta.url)),
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
        pluginName: '@mdx-js/esbuild',
        text: 'Unexpected character `/` (U+002F) before local name, expected a character that can start a name, such as a letter, `$`, or `_` (note: to create a link in MDX, use `[text](url)`)',
        id: ''
      },
      'should pass errors (1)'
    )
  }

  await fs.unlink(new URL('esbuild-broken.mdx', import.meta.url))

  await fs.writeFile(
    new URL('esbuild-warnings.mdx', import.meta.url),
    'export const Message = () => <>World!</>\n\n# Hello, <Message />'
  )

  try {
    await esbuild.build({
      entryPoints: [
        fileURLToPath(new URL('esbuild-warnings.mdx', import.meta.url))
      ],
      outfile: fileURLToPath(new URL('esbuild-warnings.js', import.meta.url)),
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
                const esm = tree.children[0] // Export
                assert.ok(esm && esm.type === 'mdxjsEsm')
                const eol = tree.children[1] // EOL between both, no position.
                assert.ok(eol && eol.type === 'text')
                assert.ok(!eol.position)
                const head = tree.children[2] // Heading
                assert.ok(head && head.type === 'element')
                assert.ok(head.position)
                const text = head.children[0] // Text in heading
                assert.ok(text && text.type === 'text')
                const jsx = head.children[1] // JSX in heading
                assert.ok(jsx && jsx.type === 'mdxJsxTextElement')
                console.log(head)
                file.message('1')
                file.message('2', eol)
                file.message('3', tree)
                file.message('4', esm)
                file.message('5', text) // Text in heading
                file.message('6', jsx) // JSX in heading
                file.message('7', head.position.end).fatal = true // End of heading
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
            pluginName: '@mdx-js/esbuild',
            text: '7',
            id: ''
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
            pluginName: '@mdx-js/esbuild',
            text: '1',
            id: ''
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
            pluginName: '@mdx-js/esbuild',
            text: '2',
            id: ''
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
            pluginName: '@mdx-js/esbuild',
            text: '3',
            id: ''
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
            pluginName: '@mdx-js/esbuild',
            text: '4',
            id: ''
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
            pluginName: '@mdx-js/esbuild',
            text: '5',
            id: ''
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
            pluginName: '@mdx-js/esbuild',
            text: '6',
            id: ''
          }
        ]
      },
      'should pass warnings'
    )
  }

  await fs.unlink(new URL('esbuild-warnings.mdx', import.meta.url))

  await fs.writeFile(
    new URL('esbuild-plugin-crash.mdx', import.meta.url),
    '# hi'
  )

  try {
    await esbuild.build({
      entryPoints: [
        fileURLToPath(new URL('esbuild-plugin-crash.mdx', import.meta.url))
      ],
      outfile: fileURLToPath(
        new URL('esbuild-plugin-crash.js', import.meta.url)
      ),
      format: 'esm',
      plugins: [
        esbuildMdx({
          rehypePlugins: [
            function () {
              return () => {
                throw new Error('Something went wrong')
              }
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
      message.text = message.text.split('\n')[0]
    }

    assert.equal(
      result,
      {
        errors: [
          {
            location: {
              column: 0,
              file: 'test/esbuild-plugin-crash.mdx',
              length: 0,
              line: 0,
              lineText: '# hi',
              namespace: 'file',
              suggestion: ''
            },
            notes: [],
            pluginName: '@mdx-js/esbuild',
            text: 'Error: Something went wrong',
            id: ''
          }
        ],
        warnings: []
      },
      'should pass errors (2)'
    )
  }

  await fs.unlink(new URL('esbuild-plugin-crash.mdx', import.meta.url))

  console.log('\nnote: the preceding errors and warnings are expected!\n')

  /** @type {(contents: string) => import('esbuild').Plugin} */
  const inlinePlugin = (contents) => ({
    name: 'inline plugin',
    setup(build) {
      build.onResolve({filter: /esbuild\.mdx/}, () => ({
        path: fileURLToPath(new URL('esbuild.mdx', import.meta.url)),
        pluginData: {contents}
      }))
    }
  })

  await esbuild.build({
    entryPoints: [fileURLToPath(new URL('esbuild.mdx', import.meta.url))],
    outfile: fileURLToPath(
      new URL('esbuild-compile-from-memory.js', import.meta.url)
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

  await fs.unlink(new URL('esbuild-compile-from-memory.js', import.meta.url))

  await esbuild.build({
    entryPoints: [fileURLToPath(new URL('esbuild.mdx', import.meta.url))],
    outfile: fileURLToPath(
      new URL('esbuild-compile-from-memory-empty.js', import.meta.url)
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
    new URL('esbuild-compile-from-memory-empty.js', import.meta.url)
  )

  // Remote markdown.
  await fs.writeFile(
    new URL('esbuild-with-remote-md.mdx', import.meta.url),
    'import Content from "https://raw.githubusercontent.com/mdx-js/mdx/main/packages/esbuild/test/files/md-file.md"\n\n<Content />'
  )

  await esbuild.build({
    entryPoints: [
      fileURLToPath(new URL('esbuild-with-remote-md.mdx', import.meta.url))
    ],
    outfile: fileURLToPath(
      new URL('esbuild-with-remote-md.js', import.meta.url)
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

  await fs.unlink(new URL('esbuild-with-remote-md.mdx', import.meta.url))
  await fs.unlink(new URL('esbuild-with-remote-md.js', import.meta.url))

  // Remote MDX importing more markdown.
  await fs.writeFile(
    new URL('esbuild-with-remote-mdx.mdx', import.meta.url),
    'import Content from "https://raw.githubusercontent.com/mdx-js/mdx/main/packages/esbuild/test/files/mdx-file-importing-markdown.mdx"\n\n<Content />'
  )

  await esbuild.build({
    entryPoints: [
      fileURLToPath(new URL('esbuild-with-remote-mdx.mdx', import.meta.url))
    ],
    outfile: fileURLToPath(
      new URL('esbuild-with-remote-mdx.js', import.meta.url)
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

  await fs.unlink(new URL('esbuild-with-remote-mdx.mdx', import.meta.url))
  await fs.unlink(new URL('esbuild-with-remote-mdx.js', import.meta.url))
})

test.run()
