/**
 * @typedef {import('hast').Doctype} Doctype
 * @typedef {import('hast').Element} Element
 * @typedef {import('hast').Root} Root
 * @typedef {import('mdast').Root} MdastRoot
 * @typedef {import('mdx/types.js').MDXComponents} MDXComponents
 * @typedef {import('mdx/types.js').MDXModule} MDXModule
 */

import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import {test} from 'node:test'
import {compile, compileSync, createProcessor, nodeTypes} from '@mdx-js/mdx'
import {MDXProvider} from '@mdx-js/react'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import {SourceMapGenerator} from 'source-map'
import {VFile} from 'vfile'
import {run} from './context/run.js'

test('@mdx-js/mdx: compile', async function (t) {
  await t.test('should throw when a removed option is passed', function () {
    assert.throws(function () {
      // @ts-expect-error: check how the runtime handles a removed option.
      compile('# hi!', {filepath: 'example.mdx'})
    }, /`options.filepath` is no longer supported/)
  })

  await t.test('should compile', async function () {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(await run(await compile('# hi!')))
      ),
      '<h1>hi!</h1>'
    )
  })

  await t.test('should compile a vfile', async function () {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(await run(await compile(new VFile('# hi?'))))
      ),
      '<h1>hi?</h1>'
    )
  })

  await t.test(
    'should compile (sync)',

    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(await run(compileSync('# hi!')))
        ),
        '<h1>hi!</h1>'
      )
    }
  )

  await t.test(
    'should compile an empty document',

    async function () {
      assert.equal(
        renderToStaticMarkup(React.createElement(await run(await compile('')))),
        ''
      )
    }
  )

  await t.test('should compile an empty document (remark)', async function () {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(
          await run(await compile('x', {remarkPlugins: [plugin]}))
        )
      ),
      ''
    )

    function plugin() {
      /**
       * @returns {MdastRoot}
       *   New tree.
       */
      return function () {
        return {type: 'root', children: []}
      }
    }
  })

  await t.test('should compile an empty document (rehype)', async function () {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(
          await run(
            await compile('y', {
              rehypePlugins: [plugin]
            })
          )
        )
      ),
      ''
    )

    function plugin() {
      /**
       * @returns {Root}
       *   New tree.
       */
      return function () {
        return {type: 'root', children: []}
      }
    }
  })

  await t.test(
    'should compile a document (rehype, non-representable)',
    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(
            await run(
              await compile('y', {
                rehypePlugins: [plugin]
              })
            )
          )
        ),
        ''
      )

      function plugin() {
        /**
         * @returns {Doctype}
         *   New tree.
         */
        return function () {
          return {type: 'doctype'}
        }
      }
    }
  )

  await t.test(
    'should compile a non-element document (rehype, single element)',
    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(
            await run(
              await compile('y', {
                rehypePlugins: [plugin]
              })
            )
          )
        ),
        '<x></x>'
      )

      function plugin() {
        /**
         * @returns {Element}
         *   New tree.
         */
        return function () {
          return {type: 'element', tagName: 'x', properties: {}, children: []}
        }
      }
    }
  )

  await t.test('should compile custom elements', async function () {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(
          await run(
            await compile('y', {
              rehypePlugins: [plugin]
            })
          )
        )
      ),
      '<a-b><b-c></b-c></a-b>'
    )

    function plugin() {
      /**
       * @returns {Element}
       *   New tree.
       */
      return function () {
        return {
          type: 'element',
          tagName: 'a-b',
          properties: {},
          children: [
            {type: 'element', tagName: 'b-c', properties: {}, children: []}
          ]
        }
      }
    }
  })

  await t.test(
    'should support the automatic runtime (`@jsxRuntime`)',

    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(
            await run(await compile('!', {jsxRuntime: 'automatic'}))
          )
        ),
        '<p>!</p>'
      )
    }
  )

  await t.test(
    'should support an import source (`@jsxImportSource`)',
    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(
            await run(await compile('?', {jsxImportSource: 'react'}))
          )
        ),
        '<p>?</p>'
      )
    }
  )

  await t.test(
    'should support `pragma`, `pragmaFrag`',

    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(
            await run(
              await compile('<>%</>', {
                jsxRuntime: 'classic',
                pragma: 'React.createElement',
                pragmaFrag: 'React.Fragment',
                pragmaImportSource: 'react'
              })
            )
          )
        ),
        '%'
      )
    }
  )

  await t.test(
    'should *not* support `jsxClassicImportSource` w/o `pragma`',
    async function () {
      try {
        await compile('import React from "react"\n\n.', {
          jsxRuntime: 'classic',
          pragmaImportSource: 'react',
          pragma: ''
        })
        assert.fail()
      } catch (error) {
        assert.match(
          String(error),
          /Missing `pragma` in classic runtime with `pragmaImportSource`/
        )
      }
    }
  )

  await t.test(
    'should support passing in `components` to `MDXContent`',
    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(await run(await compile('<X />')), {
            components: {
              /**
               * @param {JSX.IntrinsicElements['span']} props
               *   Props.
               */
              X(props) {
                return React.createElement('span', props, '!')
              }
            }
          })
        ),
        '<span>!</span>'
      )
    }
  )

  await t.test(
    'should support passing in `components` (for members) to `MDXContent`',
    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(await run(await compile('<x.y />')), {
            components: {
              x: {
                /**
                 * @param {JSX.IntrinsicElements['span']} props
                 *   Props.
                 */
                y(props) {
                  return React.createElement('span', props, '?')
                }
              }
            }
          })
        ),
        '<span>?</span>'
      )
    }
  )

  await t.test(
    'should support passing in `components` directly and as an object w/ members',

    async function () {
      X.Y = Y

      assert.equal(
        renderToStaticMarkup(
          React.createElement(await run(await compile('<X /> and <X.Y />')), {
            components: {X}
          })
        ),
        '<p><span>!</span> and <span>?</span></p>'
      )

      /**
       * @param {JSX.IntrinsicElements['span']} props
       *   Props.
       * @returns {JSX.Element}
       *   Element.
       */
      function X(props) {
        return React.createElement('span', props, '!')
      }

      /**
       * @param {JSX.IntrinsicElements['span']} props
       *   Props.
       * @returns {JSX.Element}
       *   Element.
       */
      function Y(props) {
        return React.createElement('span', props, '?')
      }
    }
  )

  await t.test(
    'should support overwriting components by passing them to `MDXContent`',

    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(await run(await compile('*a*')), {
            components: {
              em(props) {
                return React.createElement('i', props)
              }
            }
          })
        ),
        '<p><i>a</i></p>'
      )
    }
  )

  await t.test(
    'should *not* support overwriting components in exports',
    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(
            await run(
              await compile(
                'export function X() { return <em>a</em> }\n\n*a*, <X>b</X>'
              )
            ),
            {
              components: {
                em(props) {
                  return React.createElement('i', props)
                }
              }
            }
          )
        ),
        '<p><i>a</i>, <em>a</em></p>'
      )
    }
  )

  await t.test(
    'should throw on missing components in exported components',
    async function () {
      await assert.rejects(async function () {
        return renderToStaticMarkup(
          React.createElement(
            await run(
              await compile('export function X() { return <Y /> }\n\n<X />')
            )
          )
        )
      }, /Y is not defined/)
    }
  )

  await t.test(
    'should support provided components in exported components',
    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(
            MDXProvider,
            {
              components: {
                Y() {
                  return React.createElement('span', {}, '!')
                }
              }
            },
            React.createElement(
              await run(
                await compile('export function X() { return <Y /> }\n\n<X />', {
                  providerImportSource: '@mdx-js/react'
                })
              )
            )
          )
        ),
        '<span>!</span>'
      )
    }
  )

  await t.test(
    'should support provided components in exported components (arrow function)',
    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(
            MDXProvider,
            {
              components: {
                Y() {
                  return React.createElement('span', {}, '!')
                }
              }
            },
            React.createElement(
              await run(
                await compile('export const X = () => <Y />\n\n<X />', {
                  providerImportSource: '@mdx-js/react'
                })
              )
            )
          )
        ),
        '<span>!</span>'
      )
    }
  )

  await t.test(
    'should support custom components in exported components',

    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(
            await run(
              await compile(
                'export function Foo({Box = "div"}) { return <Box>a</Box>; }\n\n<Foo />'
              )
            )
          )
        ),
        '<div>a</div>'
      )
    }
  )

  await t.test(
    'should support provided component objects in exported components',
    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(
            MDXProvider,
            {
              components: {
                y: {
                  z() {
                    return React.createElement('span', {}, '!')
                  }
                }
              }
            },
            React.createElement(
              await run(
                await compile(
                  'export function X() { return <y.z /> }\n\n<X />',
                  {
                    providerImportSource: '@mdx-js/react'
                  }
                )
              )
            )
          )
        ),
        '<span>!</span>'
      )
    }
  )

  await t.test(
    'should support setting the layout by passing it (as `wrapper`) to `MDXContent`',
    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(await run(await compile('a')), {
            components: {
              /**
               * @param {JSX.IntrinsicElements['div'] & {components: MDXComponents}} props
               *   Props.
               */
              wrapper(props) {
                const {components, ...rest} = props
                return React.createElement('div', rest)
              }
            }
          })
        ),
        '<div><p>a</p></div>'
      )
    }
  )

  await t.test(
    'should support setting the layout through a class component',
    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(
            await run(
              await compile(
                'import React from "react"\nexport default class extends React.Component { render() { return this.props.children } }\n\na'
              )
            )
          )
        ),
        '<p>a</p>'
      )
    }
  )

  await t.test(
    'should *not* support overwriting the layout by passing one (as `wrapper`) to `MDXContent`',
    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(
            await run(
              await compile(
                'export default function Layout({components, ...props}) { return <section {...props} /> }\n\na'
              )
            ),
            {
              components: {
                /**
                 * @param {JSX.IntrinsicElements['article'] & {components: MDXComponents}} props
                 *   Props.
                 */
                wrapper(props) {
                  const {components, ...rest} = props
                  return React.createElement('article', rest)
                }
              }
            }
          )
        ),
        '<section><p>a</p></section>'
      )
    }
  )

  await t.test('should *not* support multiple layouts (1)', async function () {
    try {
      await compile(
        'export default function a() {}\n\nexport default function b() {}\n\n.'
      )
      assert.fail()
    } catch (error) {
      assert.match(
        String(error),
        /Cannot specify multiple layouts \(previous: 1:1-1:31\)/
      )
    }
  })

  await t.test('should *not* support multiple layouts (2)', async function () {
    try {
      await compile(
        'export default function a() {}\n\nexport {Layout as default} from "./components.js"\n\n.'
      )
      assert.fail()
    } catch (error) {
      assert.match(
        String(error),
        /Cannot specify multiple layouts \(previous: 1:1-1:31\)/
      )
    }
  })

  await t.test(
    'should support an identifier as an export default',
    async function () {
      await assert.rejects(async function () {
        renderToStaticMarkup(
          React.createElement(await run(await compile('export default a')))
        )
      }, new ReferenceError('a is not defined'))
    }
  )

  await t.test(
    'should throw if a required component is not passed',
    async function () {
      await assert.rejects(async function () {
        renderToStaticMarkup(
          React.createElement(await run(await compile('<X />')))
        )
      }, /Expected component `X` to be defined/)
    }
  )

  await t.test(
    'should throw if a required member is not passed',
    async function () {
      await assert.rejects(async function () {
        renderToStaticMarkup(
          React.createElement(await run(await compile('<a.b />')))
        )
      }, /Expected object `a` to be defined/)
    }
  )

  await t.test(
    'should throw if a used member is not defined locally',

    async function () {
      await assert.rejects(async function () {
        renderToStaticMarkup(
          React.createElement(
            await run(await compile('export const a = {}\n\n<a.b />'))
          )
        )
      }, /Expected component `a.b` to be defined/)
    }
  )

  await t.test(
    'should throw if a used member is not defined locally (JSX in a function)',
    async function () {
      await assert.rejects(async function () {
        renderToStaticMarkup(
          React.createElement(
            await run(
              await compile('<a render={function () { return <x.y /> }} />')
            )
          )
        )
      }, /Expected object `x` to be defined/)
    }
  )

  await t.test(
    'should render if a used member is defined locally (JSX in a function)',
    async function () {
      const Content = await run(
        await compile('<a render={function (x) { return <x.y /> }} />')
      )

      console.log('note: the following warning is expected!')
      const result = renderToStaticMarkup(React.createElement(Content))
      console.log('note: the preceding warning is expected!')

      assert.equal(result, '<a></a>')
    }
  )

  await t.test(
    'should expose source information in the automatic jsx dev runtime',
    async function () {
      const file = await compile(
        {value: '<div />', path: 'path/to/file.js'},
        {development: true}
      )

      const developmentSourceNode = (await run(file))({})

      assert.deepEqual(
        // @ts-expect-error: `_source` is untyped but exists.
        developmentSourceNode._source,
        {fileName: 'path/to/file.js', lineNumber: 1, columnNumber: 1}
      )
    }
  )

  await t.test(
    'should pass more info to errors w/ `development: true`',
    async function () {
      await assert.rejects(async function () {
        renderToStaticMarkup(
          React.createElement(
            await run(await compile('<X />', {development: true}))
          )
        )
      }, /It’s referenced in your code at `1:1-1:6/)
    }
  )

  await t.test(
    'should show what file contains the error w/ `development: true`, and `path`',
    async function () {
      await assert.rejects(async function () {
        renderToStaticMarkup(
          React.createElement(
            await run(
              await compile(
                {value: 'asd <a.b />', path: 'folder/example.mdx'},
                {development: true}
              )
            )
          )
        )
      }, /It’s referenced in your code at `1:5-1:12` in `folder\/example.mdx`/)
    }
  )

  await t.test(
    'should support setting components through context with a `providerImportSource`',
    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(
            MDXProvider,
            {
              components: {
                em(props) {
                  return React.createElement('i', props)
                }
              }
            },
            React.createElement(
              await run(
                await compile('*z*', {providerImportSource: '@mdx-js/react'})
              )
            )
          )
        ),
        '<p><i>z</i></p>'
      )
    }
  )

  await t.test(
    'should throw if a required component is not passed or given to `MDXProvider`',
    async function () {
      await assert.rejects(async function () {
        renderToStaticMarkup(
          React.createElement(
            await run(
              await compile('<X />', {providerImportSource: '@mdx-js/react'})
            )
          )
        )
      }, /Expected component `X` to be defined/)
    }
  )

  await t.test(
    'should detect as `mdx` by default',

    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(await run(await compile({value: '\tx'})))
        ),
        '<p>x</p>'
      )
    }
  )

  await t.test('should detect `.md` as `md`', async function () {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(
          await run(await compile({value: '\tx', path: 'y.md'}))
        )
      ),
      '<pre><code>x\n</code></pre>'
    )
  })

  await t.test('should detect `.mdx` as `mdx`', async function () {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(
          await run(await compile({value: '\tx', path: 'y.mdx'}))
        )
      ),
      '<p>x</p>'
    )
  })

  await t.test('should not “detect” `.md` w/ `format: mdx`', async function () {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(
          await run(
            await compile({value: '\tx', path: 'y.md'}, {format: 'mdx'})
          )
        )
      ),
      '<p>x</p>'
    )
  })

  await t.test('should not “detect” `.mdx` w/ `format: md`', async function () {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(
          await run(
            await compile({value: '\tx', path: 'y.mdx'}, {format: 'md'})
          )
        )
      ),
      '<pre><code>x\n</code></pre>'
    )
  })

  await t.test(
    'should not support HTML in markdown by default',

    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(
            await run(await compile({value: '<q>r</q>', path: 's.md'}))
          )
        ),
        '<p>r</p>'
      )
    }
  )

  await t.test(
    'should support HTML in markdown w/ `rehype-raw`',
    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(
            await run(
              await compile(
                {value: '<q>r</q>', path: 's.md'},
                {rehypePlugins: [rehypeRaw]}
              )
            )
          )
        ),
        '<p><q>r</q></p>'
      )
    }
  )

  await t.test(
    'should support injected MDX nodes w/ `rehype-raw`',

    async function () {
      assert.match(
        String(
          await compile('a', {
            format: 'md',
            remarkPlugins: [plugin],
            rehypePlugins: [[rehypeRaw, {passThrough: nodeTypes}]]
          })
        ),
        /var a = 1/
      )

      function plugin() {
        /**
         * @param {MdastRoot} tree
         *   Tree.
         * @returns {undefined}
         *   Nothing.
         */
        return function (tree) {
          tree.children.unshift({
            type: 'mdxjsEsm',
            value: '',
            data: {
              estree: {
                type: 'Program',
                comments: [],
                sourceType: 'module',
                body: [
                  {
                    type: 'VariableDeclaration',
                    kind: 'var',
                    declarations: [
                      {
                        type: 'VariableDeclarator',
                        id: {type: 'Identifier', name: 'a'},
                        init: {type: 'Literal', value: 1}
                      }
                    ]
                  }
                ]
              }
            }
          })
        }
      }
    }
  )

  await t.test(
    'should support tag names that are not valid JavaScript identifiers with layouts (GH-2112)',
    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(
            await run(
              await compile('export default function () {}', {
                rehypePlugins: [plugin]
              })
            )
          )
        ),
        ''
      )

      function plugin() {
        /**
         * @param {Root} tree
         *   Tree.
         * @returns {undefined}
         *   Nothing.
         */

        return function (tree) {
          tree.children.push({
            type: 'element',
            tagName: 'custom-element',
            properties: {},
            children: []
          })
        }
      }
    }
  )

  await t.test('should support source maps', async function () {
    const base = new URL('context/', import.meta.url)
    const url = new URL('sourcemap.js', base)
    const file = await compile(
      'export function Component() {\n  a()\n}\n\n<Component />',
      {SourceMapGenerator}
    )

    file.value +=
      '\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,' +
      btoa(JSON.stringify(file.map)) +
      '\n'

    await fs.writeFile(url, String(file))

    /** @type {MDXModule} */
    const mod = await import(url.href + '#' + Math.random())
    const Content = mod.default

    assert.throws(
      function () {
        renderToStaticMarkup(React.createElement(Content))
      },
      function (error) {
        const exception = /** @type {Error} */ (error)
        const match = /at Component \(([^)]+)\)/.exec(String(exception.stack))
        const actual = match?.[1].split(/\\|\//g).join('/') || ''
        return (base.pathname + 'unknown.mdx:2:3').endsWith(actual)
      }
    )

    await fs.unlink(url)
  })
})

test('@mdx-js/mdx: compile (JSX)', async function (t) {
  await t.test('should serialize JSX w/ `jsx: true`', async function () {
    assert.equal(
      String(await compile('*a*', {jsx: true})),
      [
        '/*@jsxRuntime automatic @jsxImportSource react*/',
        'function _createMdxContent(props) {',
        '  const _components = {',
        '    em: "em",',
        '    p: "p",',
        '    ...props.components',
        '  };',
        '  return <_components.p><_components.em>{"a"}</_components.em></_components.p>;',
        '}',
        'function MDXContent(props = {}) {',
        '  const {wrapper: MDXLayout} = props.components || ({});',
        '  return MDXLayout ? <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout> : _createMdxContent(props);',
        '}',
        'export default MDXContent;',
        ''
      ].join('\n')
    )
  })

  await t.test('should serialize props', async function () {
    assert.equal(
      String(await compile('<a {...b} c d="1" e={1} />', {jsx: true})),
      [
        '/*@jsxRuntime automatic @jsxImportSource react*/',
        'function _createMdxContent(props) {',
        '  return <a {...b} c d="1" e={1} />;',
        '}',
        'function MDXContent(props = {}) {',
        '  const {wrapper: MDXLayout} = props.components || ({});',
        '  return MDXLayout ? <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout> : _createMdxContent(props);',
        '}',
        'export default MDXContent;',
        ''
      ].join('\n')
    )
  })

  await t.test(
    'should serialize fragments, namespaces, members',
    async function () {
      assert.equal(
        String(await compile('<><a:b /><c.d/></>', {jsx: true})),
        [
          '/*@jsxRuntime automatic @jsxImportSource react*/',
          'function _createMdxContent(props) {',
          '  const {c} = props.components || ({});',
          '  if (!c) _missingMdxReference("c", false);',
          '  if (!c.d) _missingMdxReference("c.d", true);',
          '  return <><><a:b /><c.d /></></>;',
          '}',
          'function MDXContent(props = {}) {',
          '  const {wrapper: MDXLayout} = props.components || ({});',
          '  return MDXLayout ? <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout> : _createMdxContent(props);',
          '}',
          'export default MDXContent;',
          'function _missingMdxReference(id, component) {',
          '  throw new Error("Expected " + (component ? "component" : "object") + " `" + id + "` to be defined: you likely forgot to import, pass, or provide it.");',
          '}',
          ''
        ].join('\n')
      )
    }
  )

  await t.test('should serialize fragments, expressions', async function () {
    assert.equal(
      String(await compile('<>a {/* 1 */} b</>', {jsx: true})),
      [
        '/*@jsxRuntime automatic @jsxImportSource react*/',
        '/*1*/',
        'function _createMdxContent(props) {',
        '  return <><>{"a "}{}{" b"}</></>;',
        '}',
        'function MDXContent(props = {}) {',
        '  const {wrapper: MDXLayout} = props.components || ({});',
        '  return MDXLayout ? <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout> : _createMdxContent(props);',
        '}',
        'export default MDXContent;',
        ''
      ].join('\n')
    )
  })

  await t.test(
    'should serialize custom elements inside expressions',
    async function () {
      assert.equal(
        String(await compile('{<a-b></a-b>}', {jsx: true})),
        [
          '/*@jsxRuntime automatic @jsxImportSource react*/',
          'function _createMdxContent(props) {',
          '  const _components = {',
          '    "a-b": "a-b",',
          '    ...props.components',
          '  }, _component0 = _components["a-b"];',
          '  return <>{<_component0></_component0>}</>;',
          '}',
          'function MDXContent(props = {}) {',
          '  const {wrapper: MDXLayout} = props.components || ({});',
          '  return MDXLayout ? <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout> : _createMdxContent(props);',
          '}',
          'export default MDXContent;',
          ''
        ].join('\n')
      )
    }
  )

  await t.test('should support using props', async function () {
    assert.equal(
      String(await compile('Hello {props.name}', {jsx: true})),
      [
        '/*@jsxRuntime automatic @jsxImportSource react*/',
        'function _createMdxContent(props) {',
        '  const _components = {',
        '    p: "p",',
        '    ...props.components',
        '  };',
        '  return <_components.p>{"Hello "}{props.name}</_components.p>;',
        '}',
        'function MDXContent(props = {}) {',
        '  const {wrapper: MDXLayout} = props.components || ({});',
        '  return MDXLayout ? <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout> : _createMdxContent(props);',
        '}',
        'export default MDXContent;',
        ''
      ].join('\n')
    )
  })

  await t.test(
    'should not have a conditional expression for `MDXLayout` when there is an internal layout',
    async function () {
      assert.equal(
        String(
          await compile(
            'export default function Layout({components, ...props}) { return <section {...props} /> }\n\na',
            {jsx: true}
          )
        ),
        [
          '/*@jsxRuntime automatic @jsxImportSource react*/',
          'const MDXLayout = function Layout({components, ...props}) {',
          '  return <section {...props} />;',
          '};',
          'function _createMdxContent(props) {',
          '  const _components = {',
          '    p: "p",',
          '    ...props.components',
          '  };',
          '  return <_components.p>{"a"}</_components.p>;',
          '}',
          'function MDXContent(props = {}) {',
          '  return <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout>;',
          '}',
          'export default MDXContent;',
          ''
        ].join('\n')
      )
    }
  )

  await t.test(
    'should combine passing `components` w/ props and a provider',
    async function () {
      assert.equal(
        String(
          await compile('a', {
            jsx: true,
            providerImportSource: '@mdx-js/react'
          })
        ),
        [
          '/*@jsxRuntime automatic @jsxImportSource react*/',
          'import {useMDXComponents as _provideComponents} from "@mdx-js/react";',
          'function _createMdxContent(props) {',
          '  const _components = {',
          '    p: "p",',
          '    ..._provideComponents(),',
          '    ...props.components',
          '  };',
          '  return <_components.p>{"a"}</_components.p>;',
          '}',
          'function MDXContent(props = {}) {',
          '  const {wrapper: MDXLayout} = {',
          '    ..._provideComponents(),',
          '    ...props.components',
          '  };',
          '  return MDXLayout ? <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout> : _createMdxContent(props);',

          '}',
          'export default MDXContent;',
          ''
        ].join('\n')
      )
    }
  )

  await t.test(
    'should serialize double quotes in attribute values',
    async function () {
      assert.match(
        String(await compile("{<w x='y \" z' />}", {jsx: true})),
        /x="y &quot; z"/
      )
    }
  )

  await t.test(
    'should serialize `<` and `{` in JSX text',

    async function () {
      assert.match(
        String(await compile('{<>a &amp; b &#123; c &lt; d</>}', {jsx: true})),
        /a & b &#123; c &lt; d/
      )
    }
  )

  await t.test(
    'should use React props and DOM styles by default',
    async function () {
      assert.match(
        String(
          await compile('', {
            rehypePlugins: [plugin],
            jsx: true
          })
        ),
        /className="b"/
      )

      function plugin() {
        /**
         * @param {Root} tree
         *   Tree.
         * @returns {undefined}
         *   Nothing.
         */
        return function (tree) {
          tree.children.push({
            type: 'element',
            tagName: 'a',
            properties: {
              className: 'b',
              style: '-webkit-box-shadow: 0 0 1px 0 red'
            },
            children: []
          })
        }
      }
    }
  )

  await t.test(
    'should support `elementAttributeNameCase` and `stylePropertyNameCase`',
    async function () {
      assert.match(
        String(
          await compile('', {
            rehypePlugins: [plugin],
            elementAttributeNameCase: 'html',
            stylePropertyNameCase: 'css',
            jsx: true
          })
        ),
        /class="b"/
      )

      function plugin() {
        /**
         * @param {Root} tree
         *   Tree.
         * @returns {undefined}
         *   Nothing.
         */
        return function (tree) {
          tree.children.push({
            type: 'element',
            tagName: 'a',
            properties: {
              className: 'b',
              style: '-webkit-box-shadow: 0 0 1px 0 red'
            },
            children: []
          })
        }
      }
    }
  )

  await t.test('should support `tableCellAlignToStyle`', async function () {
    assert.match(
      String(
        await compile('| a |\n| :- |', {
          remarkPlugins: [remarkGfm],
          tableCellAlignToStyle: true,
          jsx: true
        })
      ),
      /textAlign: "left"/
    )

    assert.match(
      String(
        await compile('| a |\n| :- |', {
          remarkPlugins: [remarkGfm],
          tableCellAlignToStyle: false,
          jsx: true
        })
      ),
      /align="left"/
    )
  })
})

test('@mdx-js/mdx: createProcessor', async function (t) {
  await t.test(
    'should support `createProcessor`',

    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(await run(await createProcessor().process('x')))
        ),
        '<p>x</p>'
      )
    }
  )

  await t.test('should support `format: md`', async function () {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(
          await run(await createProcessor({format: 'md'}).process('\tx'))
        )
      ),
      '<pre><code>x\n</code></pre>'
    )
  })

  await t.test('should support `format: mdx`', async function () {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(
          await run(await createProcessor({format: 'mdx'}).process('\tx'))
        )
      ),
      '<p>x</p>'
    )
  })

  await t.test('should not support `format: detect`', async function () {
    assert.throws(function () {
      // @ts-expect-error: check how runtime handles an incorrect `format: 'detect'`.
      createProcessor({format: 'detect'})
    }, new Error("Incorrect `format: 'detect'`: `createProcessor` can support either `md` or `mdx`; it does not support detecting the format"))
  })
})
