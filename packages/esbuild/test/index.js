/**
 * @typedef {import('esbuild').BuildFailure} BuildFailure
 * @typedef {import('hast').Root} Root
 * @typedef {import('vfile').VFile} VFile
 * @typedef {import('mdx/types.js').MDXModule} MDXModule
 * @typedef {import('mdx/types.js').MDXContent} MDXContent
 *
 * Augment node types:
 * @typedef {import('remark-mdx')}
 */

import assert from 'node:assert/strict'
import {promises as fs} from 'node:fs'
import {test} from 'node:test'
import {fileURLToPath} from 'node:url'
import esbuild from 'esbuild'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import esbuildMdx from '../index.js'

test('@mdx-js/esbuild', async (t) => {
  await t.test('should compile MDX', async () => {
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

    /** @type {MDXModule} */
    // @ts-expect-error: dynamically generated file.
    const mod = await import('./esbuild.js')
    const Content = mod.default

    assert.equal(
      renderToStaticMarkup(React.createElement(Content)),
      '<h1>Hello, World!</h1>',
      'should compile'
    )
  })

  await fs.rm(new URL('esbuild.mdx', import.meta.url), {force: true})
  await fs.rm(new URL('esbuild.js', import.meta.url), {force: true})

  await t.test('should resolve directory and compile', async () => {
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
    /** @type {MDXModule} */
    // @ts-expect-error: dynamically generated file.
    const mod = await import('./esbuild-resolve.js')
    const Content = mod.default

    assert.equal(renderToStaticMarkup(React.createElement(Content)), '0.1')
  })

  await fs.rm(new URL('esbuild-resolve.mdx', import.meta.url), {force: true})
  await fs.rm(new URL('esbuild-resolve.js', import.meta.url), {force: true})
  await fs.rm(new URL('folder/', import.meta.url), {
    force: true,
    recursive: true
  })

  await t.test('should compile `.md`', async () => {
    await fs.writeFile(new URL('esbuild.md', import.meta.url), '\ta')

    await esbuild.build({
      bundle: true,
      define: {'process.env.NODE_ENV': '"development"'},
      entryPoints: [fileURLToPath(new URL('esbuild.md', import.meta.url))],
      outfile: fileURLToPath(new URL('esbuild-md.js', import.meta.url)),
      format: 'esm',
      plugins: [esbuildMdx()]
    })

    /** @type {MDXModule} */
    // @ts-expect-error: dynamically generated file.
    const mod = await import('./esbuild-md.js')
    const Content = mod.default

    assert.equal(
      renderToStaticMarkup(React.createElement(Content)),
      '<pre><code>a\n</code></pre>'
    )
  })

  await fs.rm(new URL('esbuild.md', import.meta.url), {force: true})
  await fs.rm(new URL('esbuild-md.js', import.meta.url), {force: true})

  await t.test('should compile `.md` as MDX w/ configuration', async () => {
    await fs.writeFile(new URL('esbuild.md', import.meta.url), '\ta')

    await esbuild.build({
      bundle: true,
      define: {'process.env.NODE_ENV': '"development"'},
      entryPoints: [fileURLToPath(new URL('esbuild.md', import.meta.url))],
      outfile: fileURLToPath(new URL('esbuild-md-as-mdx.js', import.meta.url)),
      format: 'esm',
      plugins: [esbuildMdx({mdExtensions: [], mdxExtensions: ['.md']})]
    })

    /** @type {MDXModule} */
    // @ts-expect-error: dynamically generated file.
    const mod = await import('./esbuild-md-as-mdx.js')
    const Content = mod.default

    assert.equal(renderToStaticMarkup(React.createElement(Content)), '<p>a</p>')
  })

  await fs.rm(new URL('esbuild.md', import.meta.url), {force: true})
  await fs.rm(new URL('esbuild-md-as-mdx.js', import.meta.url), {force: true})

  await t.test('should not handle `.md` files w/ `format: mdx`', async () => {
    await fs.writeFile(new URL('esbuild.md', import.meta.url), 'a')
    await fs.writeFile(new URL('esbuild.mdx', import.meta.url), 'a')

    await assert.rejects(
      esbuild.build({
        logLevel: 'silent',
        entryPoints: [fileURLToPath(new URL('esbuild.md', import.meta.url))],
        outfile: fileURLToPath(
          new URL('esbuild-md-as-mdx.js', import.meta.url)
        ),
        plugins: [esbuildMdx({format: 'mdx'})]
      }),
      /No loader is configured for "\.md" files/
    )
  })

  await t.test('should not handle `.mdx` files w/ `format: md`', async () => {
    await assert.rejects(
      esbuild.build({
        logLevel: 'silent',
        entryPoints: [fileURLToPath(new URL('esbuild.mdx', import.meta.url))],
        outfile: fileURLToPath(
          new URL('esbuild-md-as-mdx.js', import.meta.url)
        ),
        plugins: [esbuildMdx({format: 'md'})]
      }),
      /No loader is configured for "\.mdx" files/
    )
  })

  await fs.rm(new URL('esbuild.md', import.meta.url), {force: true})
  await fs.rm(new URL('esbuild.mdx', import.meta.url), {force: true})

  await t.test('should pass errors (1)', async () => {
    await fs.writeFile(
      new URL('esbuild-broken.mdx', import.meta.url),
      'asd <https://example.com>?'
    )

    await assert.rejects(
      esbuild.build({
        logLevel: 'silent',
        entryPoints: [
          fileURLToPath(new URL('esbuild-broken.mdx', import.meta.url))
        ],
        outfile: fileURLToPath(new URL('esbuild.js', import.meta.url)),
        plugins: [esbuildMdx()]
      }),
      (error) => {
        const exception = /** @type {BuildFailure} */ (error)
        const message = exception.errors[0]
        // type-coverage:ignore-next-line
        delete message.detail
        assert.deepEqual(message, {
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
        })
        return true
      }
    )
  })

  await fs.rm(new URL('esbuild-broken.mdx', import.meta.url), {force: true})

  await t.test('should pass warnings', async () => {
    await fs.writeFile(
      new URL('esbuild-warnings.mdx', import.meta.url),
      'export const Message = () => <>World!</>\n\n# Hello, <Message />'
    )

    await assert.rejects(
      esbuild.build({
        logLevel: 'silent',
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
                  assert.equal(esm?.type, 'mdxjsEsm')
                  const eol = tree.children[1] // EOL between both, no position.
                  assert.equal(eol?.type, 'text')
                  assert.ok(!eol.position)
                  const head = tree.children[2] // Heading
                  assert.equal(head?.type, 'element')
                  assert.ok(head.position)
                  const text = head.children[0] // Text in heading
                  assert.equal(text?.type, 'text')
                  const jsx = head.children[1] // JSX in heading
                  assert.equal(jsx?.type, 'mdxJsxTextElement')
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
      }),
      (error) => {
        /** @type {BuildFailure} */
        const result = JSON.parse(JSON.stringify(error))

        for (const message of [...result.errors, ...result.warnings]) {
          // type-coverage:ignore-next-line
          delete message.detail
        }

        assert.deepEqual(result, {
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
        })
        return true
      }
    )
  })

  await fs.rm(new URL('esbuild-warnings.mdx', import.meta.url), {force: true})

  await t.test('should pass errors (2)', async () => {
    await fs.writeFile(
      new URL('esbuild-plugin-crash.mdx', import.meta.url),
      '# hi'
    )

    await assert.rejects(
      esbuild.build({
        logLevel: 'silent',
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
      }),
      (error) => {
        /** @type {BuildFailure} */
        const result = JSON.parse(JSON.stringify(error))

        for (const message of [...result.errors, ...result.warnings]) {
          // type-coverage:ignore-next-line
          delete message.detail
          message.text = message.text.split('\n')[0]
        }

        assert.deepEqual(result, {
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
        })
        return true
      }
    )
  })

  await fs.rm(new URL('esbuild-plugin-crash.mdx', import.meta.url), {
    force: true
  })

  await t.test('should compile from `pluginData.content`', async () => {
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

    /** @type {MDXModule} */
    // @ts-expect-error: dynamically generated file.
    const mod = await import('./esbuild-compile-from-memory.js')
    const Content = mod.default

    assert.equal(
      renderToStaticMarkup(React.createElement(Content)),
      '<h1>Test</h1>'
    )
  })

  await fs.rm(new URL('esbuild-compile-from-memory.js', import.meta.url), {
    force: true
  })

  await t.test(
    'should compile from `pluginData.content` when an empty string is passed',
    async () => {
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

      /** @type {MDXModule} */
      // @ts-expect-error: dynamically generated file.
      const mod = await import('./esbuild-compile-from-memory-empty.js')
      const Content = mod.default

      assert.equal(renderToStaticMarkup(React.createElement(Content)), '')
    }
  )

  await fs.rm(
    new URL('esbuild-compile-from-memory-empty.js', import.meta.url),
    {force: true}
  )

  await t.test(
    'should compile remote markdown files w/ `allowDangerousRemoteMdx`',
    async () => {
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

      /** @type {MDXModule} */
      // @ts-expect-error: dynamically generated file.
      const mod = await import('./esbuild-with-remote-md.js')
      const Content = mod.default

      assert.equal(
        renderToStaticMarkup(React.createElement(Content)),
        '<p>Some content.</p>'
      )
    }
  )

  await fs.rm(new URL('esbuild-with-remote-md.mdx', import.meta.url), {
    force: true
  })
  await fs.rm(new URL('esbuild-with-remote-md.js', import.meta.url), {
    force: true
  })

  await t.test(
    'should compile remote MD, MDX, and JS files w/ `allowDangerousRemoteMdx`',
    async () => {
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

      /** @type {MDXModule} */
      // @ts-expect-error: dynamically generated file.
      const mod = await import('./esbuild-with-remote-mdx.js')
      const Content = mod.default

      assert.equal(
        renderToStaticMarkup(React.createElement(Content)),
        '<h1>heading</h1>\n<p>A <span style="color:red">little pill</span>.</p>\n<p>Some content.</p>'
      )
    }
  )

  await fs.rm(new URL('esbuild-with-remote-mdx.mdx', import.meta.url), {
    force: true
  })
  await fs.rm(new URL('esbuild-with-remote-mdx.js', import.meta.url), {
    force: true
  })
})

/**
 * @param {string} contents
 * @returns {import('esbuild').Plugin}
 */
function inlinePlugin(contents) {
  return {
    name: 'inline plugin',
    setup(build) {
      build.onResolve({filter: /esbuild\.mdx/}, () => ({
        path: fileURLToPath(new URL('esbuild.mdx', import.meta.url)),
        pluginData: {contents}
      }))
    }
  }
}
