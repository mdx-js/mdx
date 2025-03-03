/* eslint-disable unicorn/prefer-structured-clone */

/**
 * @import {BuildFailure, Plugin} from 'esbuild'
 * @import {Root} from 'hast'
 * @import {MDXModule} from 'mdx/types.js'
 * @import {VFile} from 'vfile'
 * @import {} from 'remark-mdx'
 */

import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import {test} from 'node:test'
import {fileURLToPath} from 'node:url'
import esbuildMdx from '@mdx-js/esbuild'
import esbuild from 'esbuild'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'

test('@mdx-js/esbuild', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(Object.keys(await import('@mdx-js/esbuild')).sort(), [
      'default'
    ])
  })

  await t.test('should compile MDX', async function () {
    const mdxUrl = new URL('esbuild.mdx', import.meta.url)
    const jsUrl = new URL('esbuild.js', import.meta.url)

    await fs.writeFile(
      mdxUrl,
      'export function Message() { return <>World!</> }\n\n# Hello, <Message />'
    )

    await esbuild.build({
      bundle: true,
      define: {'process.env.NODE_ENV': '"development"'},
      entryPoints: [fileURLToPath(mdxUrl)],
      format: 'esm',
      outfile: fileURLToPath(jsUrl),
      plugins: [esbuildMdx()]
    })

    /** @type {MDXModule} */
    const result = await import(jsUrl.href + '#' + Math.random())
    const Content = result.default

    assert.equal(
      renderToStaticMarkup(React.createElement(Content)),
      '<h1>Hello, World!</h1>',
      'should compile'
    )

    await fs.rm(mdxUrl)
    await fs.rm(jsUrl)
  })

  await t.test('should support importing MDX in MDX', async function () {
    const mdxUrl = new URL('esbuild.mdx', import.meta.url)
    const folderUrl = new URL('folder/', import.meta.url)
    const folderMdxUrl = new URL('file.mdx', folderUrl)
    const folderJsUrl = new URL('file.js', folderUrl)
    const jsUrl = new URL('esbuild.js', import.meta.url)

    await fs.writeFile(
      mdxUrl,
      'import Content from "./folder/file.mdx"\n\n<Content/>'
    )
    await fs.mkdir(folderUrl)
    await fs.writeFile(folderMdxUrl, 'import {data} from "./file.js"\n\n{data}')
    await fs.writeFile(folderJsUrl, 'export const data = 0.1')

    await esbuild.build({
      bundle: true,
      define: {'process.env.NODE_ENV': '"development"'},
      entryPoints: [fileURLToPath(mdxUrl)],
      format: 'esm',
      outfile: fileURLToPath(jsUrl),
      plugins: [esbuildMdx()]
    })

    /** @type {MDXModule} */
    const result = await import(jsUrl.href + '#' + Math.random())
    const Content = result.default

    assert.equal(renderToStaticMarkup(React.createElement(Content)), '0.1')

    await fs.rm(mdxUrl)
    await fs.rm(jsUrl)
    await fs.rm(folderUrl, {force: true, recursive: true})
  })

  await t.test('should compile `.md`', async function () {
    const mdUrl = new URL('esbuild.md', import.meta.url)
    const jsUrl = new URL('esbuild.js', import.meta.url)

    await fs.writeFile(mdUrl, '\ta')

    await esbuild.build({
      bundle: true,
      define: {'process.env.NODE_ENV': '"development"'},
      entryPoints: [fileURLToPath(mdUrl)],
      format: 'esm',
      outfile: fileURLToPath(jsUrl),
      plugins: [esbuildMdx()]
    })

    /** @type {MDXModule} */
    const result = await import(jsUrl.href + '#' + Math.random())
    const Content = result.default

    assert.equal(
      renderToStaticMarkup(React.createElement(Content)),
      '<pre><code>a\n</code></pre>'
    )

    await fs.rm(mdUrl)
    await fs.rm(jsUrl)
  })

  await t.test(
    'should compile `.md` as MDX w/ configuration',
    async function () {
      const mdUrl = new URL('esbuild.md', import.meta.url)
      const jsUrl = new URL('esbuild.js', import.meta.url)

      await fs.writeFile(mdUrl, '\ta')

      await esbuild.build({
        bundle: true,
        define: {'process.env.NODE_ENV': '"development"'},
        entryPoints: [fileURLToPath(mdUrl)],
        format: 'esm',
        outfile: fileURLToPath(jsUrl),
        plugins: [esbuildMdx({mdExtensions: [], mdxExtensions: ['.md']})]
      })

      /** @type {MDXModule} */
      const result = await import(jsUrl.href + '#' + Math.random())
      const Content = result.default

      assert.equal(
        renderToStaticMarkup(React.createElement(Content)),
        '<p>a</p>'
      )

      await fs.rm(mdUrl)
      await fs.rm(jsUrl)
    }
  )

  await t.test(
    'should not handle `.md` files w/ `format: mdx`',
    async function () {
      const mdUrl = new URL('esbuild.md', import.meta.url)
      const jsUrl = new URL('esbuild.js', import.meta.url)

      await fs.writeFile(mdUrl, 'a')

      try {
        await esbuild.build({
          entryPoints: [fileURLToPath(mdUrl)],
          logLevel: 'silent',
          outfile: fileURLToPath(jsUrl),
          plugins: [esbuildMdx({format: 'mdx'})]
        })
        assert.fail()
      } catch (error) {
        assert.match(String(error), /No loader is configured for "\.md" files/)
      }

      await fs.rm(mdUrl)
    }
  )

  await t.test(
    'should not handle `.mdx` files w/ `format: md`',
    async function () {
      const mdxUrl = new URL('esbuild.mdx', import.meta.url)
      const jsUrl = new URL('esbuild.js', import.meta.url)

      await fs.writeFile(mdxUrl, 'a')

      try {
        await esbuild.build({
          entryPoints: [fileURLToPath(mdxUrl)],
          logLevel: 'silent',
          outfile: fileURLToPath(jsUrl),
          plugins: [esbuildMdx({format: 'md'})]
        })
        assert.fail()
      } catch (error) {
        assert.match(String(error), /No loader is configured for "\.mdx" files/)
      }

      await fs.rm(mdxUrl)
    }
  )

  await t.test('should pass MDX error', async function () {
    const mdxUrl = new URL('esbuild.mdx', import.meta.url)
    const jsUrl = new URL('esbuild.js', import.meta.url)

    await fs.writeFile(mdxUrl, 'asd <https://example.com>?')

    try {
      await esbuild.build({
        entryPoints: [fileURLToPath(mdxUrl)],
        logLevel: 'silent',
        outfile: fileURLToPath(jsUrl),
        plugins: [esbuildMdx()]
      })
      assert.fail()
    } catch (error) {
      const exception = /** @type {BuildFailure} */ (error)
      const message = exception.errors[0]

      delete message.detail

      assert.deepEqual(message, {
        id: '',
        location: {
          column: 11,
          file: 'test/esbuild.mdx',
          length: 1,
          line: 1,
          lineText: 'asd <https://example.com>?',
          namespace: 'file',
          suggestion: ''
        },
        notes: [],
        pluginName: '@mdx-js/esbuild',
        text:
          'Cannot process MDX file with esbuild:\n  1:12: Unexpected character `/` (U+002F) before local name, expected a character that can start a name, such as a letter, `$`, or `_` (note: to create a link in MDX, use `[text](url)`)'
      })
    }

    await fs.rm(mdxUrl)
  })

  await t.test('should pass warnings', async function () {
    const mdxUrl = new URL('esbuild.mdx', import.meta.url)
    const jsUrl = new URL('esbuild.js', import.meta.url)

    await fs.writeFile(
      mdxUrl,
      'export function Message() { return <>World!</> }\n\n# Hello, <Message />'
    )

    try {
      await esbuild.build({
        entryPoints: [fileURLToPath(mdxUrl)],
        format: 'esm',
        logLevel: 'silent',
        outfile: fileURLToPath(jsUrl),
        plugins: [esbuildMdx({rehypePlugins: [warn]})]
      })
      assert.fail()
    } catch (error) {
      /** @type {BuildFailure} */
      const result = JSON.parse(JSON.stringify(error))

      for (const message of [...result.errors, ...result.warnings]) {
        delete message.detail
      }

      assert.deepEqual(result, {
        errors: [
          {
            id: '',
            location: {
              column: 20,
              file: 'test/esbuild.mdx',
              length: 0,
              line: 3,
              lineText: '# Hello, <Message />',
              namespace: 'file',
              suggestion: ''
            },
            notes: [],
            pluginName: '@mdx-js/esbuild',
            text: '7'
          }
        ],
        warnings: [
          {
            id: '',
            location: {
              column: 0,
              file: 'test/esbuild.mdx',
              length: 0,
              line: 0,
              lineText: '',
              namespace: 'file',
              suggestion: ''
            },
            notes: [],
            pluginName: '@mdx-js/esbuild',
            text: '1'
          },
          {
            id: '',
            location: {
              column: 0,
              file: 'test/esbuild.mdx',
              length: 0,
              line: 0,
              lineText: '',
              namespace: 'file',
              suggestion: ''
            },
            notes: [],
            pluginName: '@mdx-js/esbuild',
            text: '2'
          },
          {
            id: '',
            location: {
              column: 0,
              file: 'test/esbuild.mdx',
              length: 48,
              line: 1,
              lineText: 'export function Message() { return <>World!</> }',
              namespace: 'file',
              suggestion: ''
            },
            notes: [],
            pluginName: '@mdx-js/esbuild',
            text: '3'
          },
          {
            id: '',
            location: {
              column: 0,
              file: 'test/esbuild.mdx',
              length: 48,
              line: 1,
              lineText: 'export function Message() { return <>World!</> }',
              namespace: 'file',
              suggestion: ''
            },
            notes: [],
            pluginName: '@mdx-js/esbuild',
            text: '4'
          },
          {
            id: '',
            location: {
              column: 2,
              file: 'test/esbuild.mdx',
              length: 7,
              line: 3,
              lineText: '# Hello, <Message />',
              namespace: 'file',
              suggestion: ''
            },
            notes: [],
            pluginName: '@mdx-js/esbuild',
            text: '5'
          },
          {
            id: '',
            location: {
              column: 9,
              file: 'test/esbuild.mdx',
              length: 11,
              line: 3,
              lineText: '',  // Not available when place.offset is deleted
              namespace: 'file',
              suggestion: ''
            },
            notes: [],
            pluginName: '@mdx-js/esbuild',
            text: '6'
          }
        ]
      })
    }

    await fs.rm(mdxUrl)

    function warn() {
      /**
       * @param {Root} tree
       *   Tree.
       * @param {VFile} file
       *   File.
       * @returns {undefined}
       *   Nothing.
       */
      return function (tree, file) {
        const esm = tree.children[0] // Export
        const eol = tree.children[1] // EOL between both, no position.
        const head = tree.children[2] // Heading
        assert(esm)
        assert(esm.type === 'mdxjsEsm')
        assert(eol)
        assert(eol.type === 'text')
        assert(!eol.position)
        assert(head)
        assert(head.type === 'element')
        assert(head.position)

        const text = head.children[0] // Text in heading
        const jsx = head.children[1] // JSX in heading

        assert(text)
        assert(text.type === 'text')
        assert(jsx)
        assert(jsx.type === 'mdxJsxTextElement')

        file.message('1')
        file.message('2', eol)
        file.message('3', tree)
        file.message('4', esm)
        file.message('5', text)
        delete file.message('6', jsx).place.start.offset
        file.message('7', head.position.end).fatal = true // End of heading
      }
    }
  })

  await t.test('should pass errors', async function () {
    const mdxUrl = new URL('esbuild.mdx', import.meta.url)
    const jsUrl = new URL('esbuild.js', import.meta.url)

    await fs.writeFile(mdxUrl, '# hi')

    try {
      await esbuild.build({
        logLevel: 'silent',
        entryPoints: [fileURLToPath(mdxUrl)],
        outfile: fileURLToPath(jsUrl),
        format: 'esm',
        plugins: [esbuildMdx({rehypePlugins: [crash]})]
      })
      assert.fail()
    } catch (error) {
      /** @type {BuildFailure} */
      const result = JSON.parse(JSON.stringify(error))

      assert.deepEqual(result, {
        errors: [
          {
            detail: {
              cause: {},
              fatal: true,
              message: 'Cannot process MDX file with esbuild:\n  Error: Something went wrong',
              name: '1:1',
              reason: 'Cannot process MDX file with esbuild:\n  Error: Something went wrong',
              ruleId: 'process-error',
              source: '@mdx-js/esbuild'
            },
            id: '',
            location: {
              column: 0,
              file: 'test/esbuild.mdx',
              length: 0,
              line: 0,
              lineText: '',
              namespace: 'file',
              suggestion: ''
            },
            notes: [],
            pluginName: '@mdx-js/esbuild',
            text: 'Cannot process MDX file with esbuild:\n  Error: Something went wrong'
          }
        ],
        warnings: []
      })
    }

    await fs.rm(mdxUrl)

    function crash() {
      return function () {
        throw new Error('Something went wrong')
      }
    }
  })

  await t.test('should compile from `pluginData.content`', async function () {
    const mdxUrl = new URL('esbuild.mdx', import.meta.url)
    const jsUrl = new URL('esbuild.js', import.meta.url)

    await esbuild.build({
      entryPoints: [fileURLToPath(mdxUrl)],
      outfile: fileURLToPath(jsUrl),
      plugins: [inlinePlugin('# Test'), esbuildMdx()],
      define: {'process.env.NODE_ENV': '"development"'},
      format: 'esm',
      bundle: true
    })

    /** @type {MDXModule} */
    const result = await import(jsUrl.href + '#' + Math.random())
    const Content = result.default

    assert.equal(
      renderToStaticMarkup(React.createElement(Content)),
      '<h1>Test</h1>'
    )

    await fs.rm(jsUrl)
  })

  await t.test(
    'should compile from `pluginData.content` when an empty string is passed',
    async function () {
      const mdxUrl = new URL('esbuild.mdx', import.meta.url)
      const jsUrl = new URL('esbuild.js', import.meta.url)

      await esbuild.build({
        entryPoints: [fileURLToPath(mdxUrl)],
        outfile: fileURLToPath(jsUrl),
        plugins: [inlinePlugin(''), esbuildMdx()],
        define: {'process.env.NODE_ENV': '"development"'},
        format: 'esm',
        bundle: true
      })

      /** @type {MDXModule} */
      const result = await import(jsUrl.href + '#' + Math.random())
      const Content = result.default

      assert.equal(renderToStaticMarkup(React.createElement(Content)), '')

      await fs.rm(jsUrl)
    }
  )

  await t.test('should support source maps', async () => {
    const mdxUrl = new URL('crash.mdx', import.meta.url)
    const jsUrl = new URL('crash.js', import.meta.url)
    await fs.writeFile(
      mdxUrl,
      '<Throw />\nexport function Throw() { throw new Error("Boom") }\n'
    )

    await esbuild.build({
      entryPoints: [fileURLToPath(mdxUrl)],
      outfile: fileURLToPath(jsUrl),
      plugins: [esbuildMdx()],
      define: {'process.env.NODE_ENV': '"development"'},
      format: 'esm',
      sourcemap: true,
      bundle: true
    })

    /** @type {MDXModule} */
    const result = await import(jsUrl.href)
    const Content = result.default

    assert.throws(
      () => renderToStaticMarkup(React.createElement(Content)),
      (error) => {
        assert(error instanceof Error)
        assert.equal(error.message, 'Boom')
        // Source maps are off.
        // The column should be 26, not 8.
        assert(error.stack?.includes('crash.mdx:2:8)'))
        return true
      }
    )

    await fs.rm(mdxUrl)
    await fs.rm(jsUrl)
  })

  await t.test('should use esbuild "jsx" loader for JSX output', async () => {
    const mdxUrl = new URL('esbuild.mdx', import.meta.url)
    const jsUrl = new URL('esbuild.js', import.meta.url)
    await fs.writeFile(
      mdxUrl,
      'export function Message() { return <>World!</> }\n\n# Hello, <Message />'
    )

    await esbuild.build({
      entryPoints: [fileURLToPath(mdxUrl)],
      outfile: fileURLToPath(jsUrl),
      plugins: [esbuildMdx({jsx: true})],
      define: {'process.env.NODE_ENV': '"development"'},
      format: 'esm',
      bundle: true
    })

    /** @type {MDXModule} */
    const result = await import(jsUrl.href + '#' + Math.random())
    const Content = result.default

    assert.equal(
      renderToStaticMarkup(React.createElement(Content)),
      '<h1>Hello, World!</h1>'
    )

    await fs.rm(mdxUrl)
    await fs.rm(jsUrl)
  })
})

/**
 * @param {string} contents
 *   Contents.
 * @returns {Plugin}
 *   Plugin.
 */
function inlinePlugin(contents) {
  return {
    name: 'inline plugin',
    setup(build) {
      build.onResolve({filter: /esbuild\.mdx/}, function () {
        return {
          path: fileURLToPath(new URL('esbuild.mdx', import.meta.url)),
          pluginData: {contents}
        }
      })
    }
  }
}
