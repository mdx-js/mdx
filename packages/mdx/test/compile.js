/**
 * @typedef {import('mdx/types.js').MDXModule} MDXModule
 * @typedef {import('mdx/types.js').MDXContent} MDXContent
 * @typedef {import('hast').Root} Root
 * @typedef {import('../lib/compile.js').VFileCompatible} VFileCompatible
 */

import assert from 'node:assert/strict'
import {Buffer} from 'buffer'
import {promises as fs} from 'fs'
import path from 'path'
import {test} from 'node:test'
import {nanoid} from 'nanoid'
import {h} from 'preact'
import {render} from 'preact-render-to-string'
import React from 'react'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import {VFile} from 'vfile'
import {SourceMapGenerator} from 'source-map'
// Note: Node has an experimental `--enable-source-maps` flag, but most of V8
// doesn’t seem to support it.
// So instead use a userland module.
import 'source-map-support/register.js'
import {compile, compileSync, createProcessor, nodeTypes} from '../index.js'
// @ts-expect-error: make sure a single react is used.
import {renderToStaticMarkup as renderToStaticMarkup_} from '../../react/node_modules/react-dom/server.js'
import {MDXProvider} from '../../react/index.js'

/** @type {import('react-dom/server').renderToStaticMarkup} */
const renderToStaticMarkup = renderToStaticMarkup_

test('compile', async (t) => {
  await t.test('should throw when a removed option is passed', () => {
    assert.throws(
      // @ts-expect-error: removed option.
      () => compile('# hi!', {filepath: 'example.mdx'}),
      /`options.filepath` is no longer supported/
    )
  })

  await t.test('should compile', async () => {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(await run(await compile('# hi!')))
      ),
      '<h1>hi!</h1>'
    )
  })

  await t.test('should compile a vfile', async () => {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(await run(await compile(new VFile('# hi?'))))
      ),
      '<h1>hi?</h1>'
    )
  })

  await t.test(
    'should compile (sync)',

    async () => {
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

    async () => {
      assert.equal(
        renderToStaticMarkup(React.createElement(await run(compileSync('')))),
        ''
      )
    }
  )

  await t.test('should compile an empty document (remark)', async () => {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(
          await run(
            compileSync('x', {
              remarkPlugins: [() => () => ({type: 'root', children: []})]
            })
          )
        )
      ),
      ''
    )
  })

  await t.test('should compile an empty document (rehype)', async () => {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(
          await run(
            compileSync('y', {
              rehypePlugins: [() => () => ({type: 'root', children: []})]
            })
          )
        )
      ),
      ''
    )
  })

  await t.test(
    'should compile a document (rehype, non-representable)',
    async () => {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(
            await run(
              compileSync('y', {
                rehypePlugins: [() => () => ({type: 'doctype', name: 'html'})]
              })
            )
          )
        ),
        ''
      )
    }
  )

  await t.test(
    'should compile a non-element document (rehype, single element)',
    async () => {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(
            await run(
              compileSync('y', {
                rehypePlugins: [
                  () => () => ({type: 'element', tagName: 'x', children: []})
                ]
              })
            )
          )
        ),
        '<x></x>'
      )
    }
  )

  await t.test('should compile custom elements', async () => {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(
          await run(
            compileSync('y', {
              rehypePlugins: [
                () => () => ({type: 'element', tagName: 'a-b', children: []})
              ]
            })
          )
        )
      ),
      '<a-b></a-b>'
    )
  })

  await t.test(
    'should support the automatic runtime (`@jsxRuntime`)',

    async () => {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(
            await run(compileSync('!', {jsxRuntime: 'automatic'}))
          )
        ),
        '<p>!</p>'
      )
    }
  )

  await t.test(
    'should support an import source (`@jsxImportSource`)',
    async () => {
      const node = await run(
        compileSync('?', {jsxImportSource: 'preact/compat'})
      )
      assert.equal(
        render(
          // @ts-expect-error: this fails because react/preact types conflict.
          h(node, {})
        ),
        '<p>?</p>'
      )
    }
  )

  await t.test(
    'should support `pragma`, `pragmaFrag` for `preact/compat`',

    async () => {
      const node = await run(
        compileSync('<>%</>', {
          jsxRuntime: 'classic',
          pragma: 'preact.createElement',
          pragmaFrag: 'preact.Fragment',
          pragmaImportSource: 'preact/compat'
        })
      )

      assert.equal(
        render(
          // @ts-expect-error: this fails because react/preact types conflict.
          h(node, {})
        ),
        '%'
      )
    }
  )

  await t.test(
    'should support `jsxImportSource` for `preact`',

    async () => {
      const node = await run(compileSync('<>1</>', {jsxImportSource: 'preact'}))

      assert.equal(
        render(
          // @ts-expect-error: this fails because react/preact types conflict.
          h(node, {})
        ),
        '1'
      )
    }
  )

  await t.test('should support `jsxImportSource` for `emotion`', async () => {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(
          await run(
            String(compileSync('<>+</>', {jsxImportSource: '@emotion/react'}))
          )
        )
      ),
      '+'
    )
  })

  await t.test(
    'should *not* support `jsxClassicImportSource` w/o `pragma`',
    async () => {
      assert.throws(() => {
        compileSync('import React from "react"\n\n.', {
          jsxRuntime: 'classic',
          pragmaImportSource: '@emotion/react',
          pragma: ''
        })
      }, /Missing `pragma` in classic runtime with `pragmaImportSource`/)
    }
  )

  await t.test(
    'should support passing in `components` to `MDXContent`',
    async () => {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(await run(compileSync('<X />')), {
            components: {
              /** @param {Record<string, unknown>} props */
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
    async () => {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(await run(compileSync('<x.y />')), {
            components: {
              x: {
                /** @param {Record<string, unknown>} props */
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

    async () => {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(await run(compileSync('<X /> and <X.Y />')), {
            components: {
              X: Object.assign(
                /** @param {Record<string, unknown>} props */
                (props) => React.createElement('span', props, '!'),
                {
                  /** @param {Record<string, unknown>} props */
                  Y(props) {
                    return React.createElement('span', props, '?')
                  }
                }
              )
            }
          })
        ),
        '<p><span>!</span> and <span>?</span></p>'
      )
    }
  )

  await t.test(
    'should support overwriting components by passing them to `MDXContent`',

    async () => {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(await run(compileSync('*a*')), {
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
    async () => {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(
            await run(
              compileSync('export var X = () => <em>a</em>\n\n*a*, <X>b</X>')
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
    async () => {
      await assert.rejects(
        async () =>
          renderToStaticMarkup(
            React.createElement(
              await run(compileSync('export var X = () => <Y />\n\n<X />'))
            )
          ),
        /Y is not defined/
      )
    }
  )

  await t.test(
    'should support provided components in exported components',
    async () => {
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
                compileSync('export var X = () => <Y />\n\n<X />', {
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

    async () => {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(
            await run(
              compileSync(
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
    async () => {
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
                compileSync('export var X = () => <y.z />\n\n<X />', {
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
    'should support setting the layout by passing it (as `wrapper`) to `MDXContent`',
    async () => {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(await run(compileSync('a')), {
            components: {
              /**
               * @param {Record<string, unknown>} props
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
    async () => {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(
            await run(
              compileSync(
                'import React from "react"\nexport default class extends React.Component { render() { return <>{this.props.children}</> } }\n\na'
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
    async () => {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(
            await run(
              compileSync(
                'export default function Layout({components, ...props}) { return <section {...props} /> }\n\na'
              )
            ),
            {
              components: {
                /**
                 * @param {Record<string, unknown>} props
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

  await t.test('should *not* support multiple layouts (1)', async () => {
    assert.throws(() => {
      compileSync(
        'export default function a() {}\n\nexport default function b() {}\n\n.'
      )
    }, /Cannot specify multiple layouts \(previous: 1:1-1:31\)/)
  })

  await t.test('should *not* support multiple layouts (2)', async () => {
    assert.throws(() => {
      compileSync(
        'export default function a() {}\n\nexport {Layout as default} from "./components.js"\n\n.'
      )
    }, /Cannot specify multiple layouts \(previous: 1:1-1:31\)/)
  })

  await t.test(
    'should support an identifier as an export default',
    async () => {
      await assert.rejects(async () => {
        renderToStaticMarkup(
          React.createElement(await run(compileSync('export default a')))
        )
      }, new ReferenceError('a is not defined'))
    }
  )

  await t.test(
    'should throw if a required component is not passed',
    async () => {
      await assert.rejects(async () => {
        renderToStaticMarkup(
          React.createElement(await run(compileSync('<X />')))
        )
      }, /Expected component `X` to be defined/)
    }
  )

  await t.test('should throw if a required member is not passed', async () => {
    await assert.rejects(async () => {
      renderToStaticMarkup(
        React.createElement(await run(compileSync('<a.b />')))
      )
    }, /Expected object `a` to be defined/)
  })

  await t.test(
    'should throw if a used member is not defined locally',

    async () => {
      await assert.rejects(async () => {
        renderToStaticMarkup(
          React.createElement(
            await run(compileSync('export const a = {}\n\n<a.b />'))
          )
        )
      }, /Expected component `a.b` to be defined/)
    }
  )

  await t.test(
    'should throw if a used member is not defined locally (JSX in a function)',
    async () => {
      await assert.rejects(async () => {
        renderToStaticMarkup(
          React.createElement(
            await run(compileSync('<a render={() => <x.y />} />'))
          )
        )
      }, /Expected object `x` to be defined/)
    }
  )

  await t.test(
    'should render if a used member is defined locally (JSX in a function) (The warning is expected)',
    async () => {
      console.log('\nnote: the following warning is expected!\n')
      assert.equal(
        renderToStaticMarkup(
          React.createElement(
            await run(compileSync('<a render={(x) => <x.y />} />'))
          )
        ),
        '<a></a>'
      )
      console.log('\nnote: the preceding warning is expected!\n')
    }
  )

  await t.test(
    'should expose source information in the automatic jsx dev runtime',
    async () => {
      const developmentSourceNode = (
        await run(
          compileSync(
            {value: '<div />', path: 'path/to/file.js'},
            {development: true}
          ).value
        )
      )({})

      assert.deepEqual(
        // @ts-expect-error React attaches source information on this property,
        // but it’s private and untyped.
        developmentSourceNode._source,
        {fileName: 'path/to/file.js', lineNumber: 1, columnNumber: 1}
      )
    }
  )

  await t.test(
    'should pass more info to errors w/ `development: true`',
    async () => {
      await assert.rejects(async () => {
        renderToStaticMarkup(
          React.createElement(
            await run(compileSync('<X />', {development: true}))
          )
        )
      }, /It’s referenced in your code at `1:1-1:6/)
    }
  )

  await t.test(
    'should show what file contains the error w/ `development: true`, and `path`',
    async () => {
      await assert.rejects(async () => {
        renderToStaticMarkup(
          React.createElement(
            await run(
              compileSync(
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
    async () => {
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
                compileSync('*z*', {providerImportSource: '@mdx-js/react'})
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
    async () => {
      await assert.rejects(async () => {
        renderToStaticMarkup(
          React.createElement(
            await run(
              compileSync('<X />', {providerImportSource: '@mdx-js/react'})
            )
          )
        )
      }, /Expected component `X` to be defined/)
    }
  )

  await t.test(
    'should support `createProcessor`',

    async () => {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(await run(createProcessor().processSync('x')))
        ),
        '<p>x</p>'
      )
    }
  )

  await t.test('should support `format: md`', async () => {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(
          await run(createProcessor({format: 'md'}).processSync('\tx'))
        )
      ),
      '<pre><code>x\n</code></pre>'
    )
  })

  await t.test('should support `format: mdx`', async () => {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(
          await run(createProcessor({format: 'mdx'}).processSync('\tx'))
        )
      ),
      '<p>x</p>'
    )
  })

  await t.test('should not support `format: detect`', async () => {
    assert.throws(() => {
      // @ts-expect-error incorrect `detect`.
      createProcessor({format: 'detect'})
    }, new Error("Incorrect `format: 'detect'`: `createProcessor` can support either `md` or `mdx`; it does not support detecting the format"))
  })

  await t.test(
    'should detect as `mdx` by default',

    async () => {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(await run(await compile({value: '\tx'})))
        ),
        '<p>x</p>'
      )
    }
  )

  await t.test('should detect `.md` as `md`', async () => {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(
          await run(await compile({value: '\tx', path: 'y.md'}))
        )
      ),
      '<pre><code>x\n</code></pre>'
    )
  })

  await t.test('should detect `.mdx` as `mdx`', async () => {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(
          await run(await compile({value: '\tx', path: 'y.mdx'}))
        )
      ),
      '<p>x</p>'
    )
  })

  await t.test('should not “detect” `.md` w/ `format: mdx`', async () => {
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

  await t.test('should not “detect” `.mdx` w/ `format: md`', async () => {
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

    async () => {
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

  await t.test('should support HTML in markdown w/ `rehype-raw`', async () => {
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
  })

  await t.test(
    'should support injected MDX nodes w/ `rehype-raw`',

    async () => {
      assert.match(
        String(
          await compile('a', {
            format: 'md',
            remarkPlugins: [
              () => (/** @type {Root} */ tree) => {
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
            ],
            rehypePlugins: [[rehypeRaw, {passThrough: nodeTypes}]]
          })
        ),
        /var a = 1/
      )
    }
  )
})

test('jsx', async (t) => {
  await t.test('should serialize JSX w/ `jsx: true`', () => {
    assert.equal(
      String(compileSync('*a*', {jsx: true})),
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

  await t.test('should serialize props', () => {
    assert.equal(
      String(compileSync('<a {...b} c d="1" e={1} />', {jsx: true})),
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

  await t.test('should serialize fragments, namespaces, members', () => {
    assert.equal(
      String(compileSync('<><a:b /><c.d/></>', {jsx: true})),
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
  })

  await t.test('should serialize fragments, expressions', () => {
    assert.equal(
      String(compileSync('<>a {/* 1 */} b</>', {jsx: true})),
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

  await t.test('should serialize custom elements inside expressions', () => {
    assert.equal(
      String(compileSync('{<a-b></a-b>}', {jsx: true})),
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
  })

  await t.test('should allow using props', () => {
    assert.equal(
      String(compileSync('Hello {props.name}', {jsx: true})),
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
    'should not have a conditional expression for MDXLayout when there is an internal layout',
    () => {
      assert.equal(
        String(
          compileSync(
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
    () => {
      assert.equal(
        String(
          compileSync('a', {
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

  await t.test('should serialize double quotes in attribute values', () => {
    assert.match(
      String(compileSync("{<w x='y \" z' />}", {jsx: true})),
      /x="y &quot; z"/
    )
  })

  await t.test(
    'should serialize `<` and `{` in JSX text',

    () => {
      assert.match(
        String(compileSync('{<>a &amp; b &#123; c &lt; d</>}', {jsx: true})),
        /a & b &#123; c &lt; d/
      )
    }
  )

  await t.test('should use React props and DOM styles by default', () => {
    assert.match(
      String(
        compileSync('', {
          rehypePlugins: [
            /** @type {import('unified').Plugin<[], import('hast').Root>} */
            function () {
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
          ],
          jsx: true
        })
      ),
      /className="b"/
    )
  })

  await t.test(
    'should support `elementAttributeNameCase` and `stylePropertyNameCase`',
    () => {
      assert.match(
        String(
          compileSync('', {
            rehypePlugins: [
              /** @type {import('unified').Plugin<[], import('hast').Root>} */
              function () {
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
            ],
            elementAttributeNameCase: 'html',
            stylePropertyNameCase: 'css',
            jsx: true
          })
        ),
        /class="b"/
      )
    }
  )
})

test('markdown (CM)', async (t) => {
  await t.test('should support links (resource) (`[]()` -> `a`)', async () => {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(await run(compileSync('[a](b)')))
      ),
      '<p><a href="b">a</a></p>'
    )
  })

  await t.test('should support links (reference) (`[][]` -> `a`)', async () => {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(await run(compileSync('[a]: b\n[a]')))
      ),
      '<p><a href="b">a</a></p>'
    )
  })

  await t.test(
    'should *not* support links (autolink) (`<http://a>` -> error)',
    async () => {
      assert.throws(() => {
        compileSync('<http://a>')
      }, /note: to create a link in MDX, use `\[text]\(url\)/)
    }
  )

  await t.test(
    'should support block quotes (`>` -> `blockquote`)',
    async () => {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(await run(compileSync('> a')))
        ),
        '<blockquote>\n<p>a</p>\n</blockquote>'
      )
    }
  )

  await t.test('should support characters (escape) (`\\` -> ``)', async () => {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(await run(compileSync('\\*a*')))
      ),
      '<p>*a*</p>'
    )
  })

  await t.test(
    'should support character (reference) (`&lt;` -> `<`)',
    async () => {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(await run(compileSync('&lt;')))
        ),
        '<p>&lt;</p>'
      )
    }
  )

  await t.test(
    'should support code (fenced) (` ``` ` -> `pre code`)',
    async () => {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(await run(compileSync('```\na')))
        ),
        '<pre><code>a\n</code></pre>'
      )
    }
  )

  await t.test(
    'should *not* support code (indented) (`\\ta` -> `p`)',
    async () => {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(await run(compileSync('    a')))
        ),
        '<p>a</p>'
      )
    }
  )

  await t.test('should support code (text) (`` `a` `` -> `code`)', async () => {
    assert.equal(
      renderToStaticMarkup(React.createElement(await run(compileSync('`a`')))),
      '<p><code>a</code></p>'
    )
  })

  await t.test('should support emphasis (`*` -> `em`)', async () => {
    assert.equal(
      renderToStaticMarkup(React.createElement(await run(compileSync('*a*')))),
      '<p><em>a</em></p>'
    )
  })

  await t.test(
    'should support hard break (escape) (`\\\\\\n` -> `<br>`)',
    async () => {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(await run(compileSync('a\\\nb')))
        ),
        '<p>a<br/>\nb</p>'
      )
    }
  )

  await t.test(
    'should support hard break (whitespace) (`\\\\\\n` -> `<br>`)',
    async () => {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(await run(compileSync('a  \nb')))
        ),
        '<p>a<br/>\nb</p>'
      )
    }
  )

  await t.test('should support headings (atx) (`#` -> `<h1>`)', async () => {
    assert.equal(
      renderToStaticMarkup(React.createElement(await run(compileSync('#')))),
      '<h1></h1>'
    )
  })

  await t.test('should support headings (setext) (`=` -> `<h1>`)', async () => {
    assert.equal(
      renderToStaticMarkup(React.createElement(await run(compileSync('a\n=')))),
      '<h1>a</h1>'
    )
  })

  await t.test(
    'should support list (ordered) (`1.` -> `<ol><li>`)',
    async () => {
      assert.equal(
        renderToStaticMarkup(React.createElement(await run(compileSync('1.')))),
        '<ol>\n<li></li>\n</ol>'
      )
    }
  )

  await t.test(
    'should support list (unordered) (`*` -> `<ul><li>`)',
    async () => {
      assert.equal(
        renderToStaticMarkup(React.createElement(await run(compileSync('*')))),
        '<ul>\n<li></li>\n</ul>'
      )
    }
  )

  await t.test('should support strong (`**` -> `strong`)', async () => {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(await run(compileSync('**a**')))
      ),
      '<p><strong>a</strong></p>'
    )
  })

  await t.test('should support thematic break (`***` -> `<hr>`)', async () => {
    assert.equal(
      renderToStaticMarkup(React.createElement(await run(compileSync('***')))),
      '<hr/>'
    )
  })
})

test('markdown (GFM, with `remark-gfm`)', async (t) => {
  await t.test(
    'should support links (autolink literal) (`http://a` -> `a`)',
    async () => {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(
            await run(compileSync('http://a', {remarkPlugins: [remarkGfm]}))
          )
        ),
        '<p><a href="http://a">http://a</a></p>'
      )
    }
  )

  await t.test('should support footnotes (`[^a]` -> `<sup><a…>`)', async () => {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(
          await run(compileSync('[^a]\n[^a]: b', {remarkPlugins: [remarkGfm]}))
        )
      ),
      `<p><sup><a href="#user-content-fn-a" id="user-content-fnref-a" data-footnote-ref="true" aria-describedby="footnote-label">1</a></sup></p>
<section data-footnotes="true" class="footnotes"><h2 class="sr-only" id="footnote-label">Footnotes</h2>
<ol>
<li id="user-content-fn-a">
<p>b <a href="#user-content-fnref-a" data-footnote-backref="true" class="data-footnote-backref" aria-label="Back to content">↩</a></p>
</li>
</ol>
</section>`
    )
  })

  await t.test('should support tables (`| a |` -> `<table>...`)', async () => {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(
          await run(compileSync('| a |\n| - |', {remarkPlugins: [remarkGfm]}))
        )
      ),
      '<table><thead><tr><th>a</th></tr></thead></table>'
    )
  })

  await t.test('should support task lists (`* [x]` -> `input`)', async () => {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(
          await run(
            compileSync('* [x] a\n* [ ] b', {remarkPlugins: [remarkGfm]})
          )
        )
      ),
      '<ul class="contains-task-list">\n<li class="task-list-item"><input type="checkbox" disabled="" checked=""/> a</li>\n<li class="task-list-item"><input type="checkbox" disabled=""/> b</li>\n</ul>'
    )
  })

  await t.test('should support strikethrough (`~` -> `del`)', async () => {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(
          await run(compileSync('~a~', {remarkPlugins: [remarkGfm]}))
        )
      ),
      '<p><del>a</del></p>'
    )
  })
})

test('markdown (frontmatter, `remark-frontmatter`)', async (t) => {
  await t.test('should support frontmatter (YAML)', async () => {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(
          await run(
            compileSync('---\na: b\n---\nc', {
              remarkPlugins: [remarkFrontmatter]
            })
          )
        )
      ),
      '<p>c</p>'
    )
  })

  await t.test('should support frontmatter (TOML)', async () => {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(
          await run(
            compileSync('+++\na: b\n+++\nc', {
              remarkPlugins: [[remarkFrontmatter, 'toml']]
            })
          )
        )
      ),
      '<p>c</p>'
    )
  })
})

test('markdown (math, `remark-math`, `rehype-katex`)', async () => {
  assert.match(
    renderToStaticMarkup(
      React.createElement(
        await run(
          compileSync('$C_L$', {
            remarkPlugins: [remarkMath],
            rehypePlugins: [rehypeKatex]
          })
        )
      )
    ),
    /<math/,
    'should support math (LaTeX)'
  )
})

test('remark-rehype options', async () => {
  assert.equal(
    renderToStaticMarkup(
      React.createElement(
        await run(
          compileSync('Text[^1]\n\n[^1]: Note.', {
            remarkPlugins: [remarkGfm],
            remarkRehypeOptions: {
              footnoteLabel: 'Notes',
              footnoteBackLabel: 'Back'
            }
          })
        )
      )
    ),
    `<p>Text<sup><a href="#user-content-fn-1" id="user-content-fnref-1" data-footnote-ref="true" aria-describedby="footnote-label">1</a></sup></p>
<section data-footnotes="true" class="footnotes"><h2 class="sr-only" id="footnote-label">Notes</h2>
<ol>
<li id="user-content-fn-1">
<p>Note. <a href="#user-content-fnref-1" data-footnote-backref="true" class="data-footnote-backref" aria-label="Back">↩</a></p>
</li>
</ol>
</section>`,
    'should pass options to remark-rehype'
  )
})

// See <https://github.com/mdx-js/mdx/issues/2112>
test('should support custom elements with layouts', async () => {
  assert.equal(
    renderToStaticMarkup(
      React.createElement(
        await run(
          await compile('export default function () {}', {
            rehypePlugins: [
              /** @type {import('unified').Plugin<[], import('hast').Root>} */
              function () {
                return function (tree) {
                  tree.children.push({
                    type: 'element',
                    tagName: 'custom-element',
                    properties: {},
                    children: []
                  })
                }
              }
            ]
          })
        )
      )
    ),
    '',
    'should not crash if element names are used that are not valid JavaScript identifiers, with layouts'
  )
})

test('MDX (JSX)', async (t) => {
  await t.test('should support JSX (text)', async () => {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(await run(compileSync('a <s>b</s>')))
      ),
      '<p>a <s>b</s></p>'
    )
  })

  await t.test('should support JSX (flow)', async () => {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(await run(compileSync('<div>\n  b\n</div>')))
      ),
      '<div><p>b</p></div>'
    )
  })

  await t.test('should unravel JSX (text) as an only child', async () => {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(await run(compileSync('<h1>b</h1>')))
      ),
      '<h1>b</h1>'
    )
  })

  await t.test('should unravel JSX (text) as only children', async () => {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(await run(compileSync('<a>b</a><b>c</b>')))
      ),
      '<a>b</a>\n<b>c</b>'
    )
  })

  await t.test(
    'should unravel JSX (text) and whitespace as only children',
    async () => {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(await run(compileSync('<a>b</a>\t<b>c</b>')))
        ),
        '<a>b</a>\n<b>c</b>'
      )
    }
  )

  await t.test(
    'should unravel expression (text) as an only child',
    async () => {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(await run(compileSync('{1}')))
        ),
        '1'
      )
    }
  )

  await t.test(
    'should unravel expression (text) as only children',
    async () => {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(await run(compileSync('{1}{2}')))
        ),
        '1\n2'
      )
    }
  )

  await t.test(
    'should unravel expression (text) and whitespace as only children',
    async () => {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(await run(compileSync('{1}\n{2}')))
        ),
        '1\n2'
      )
    }
  )

  await t.test('should support JSX (text, fragment)', async () => {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(await run(compileSync('a <>b</>')))
      ),
      '<p>a b</p>'
    )
  })

  await t.test('should support JSX (flow, fragment)', async () => {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(await run(compileSync('<>\n  b\n</>')))
      ),
      '<p>b</p>'
    )
  })

  await t.test('should support JSX (namespace)', async () => {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(await run(compileSync('a <x:y>b</x:y>')))
      ),
      '<p>a <x:y>b</x:y></p>'
    )
  })

  await t.test('should support expressions in MDX (text)', async () => {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(
          await run(compileSync('export const a = 1\n\na {a}'))
        )
      ),
      '<p>a 1</p>'
    )
  })

  await t.test('should support expressions in MDX (flow)', async () => {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(await run(compileSync('{\n  1 + 1\n}')))
      ),
      '2'
    )
  })

  await t.test('should support empty expressions in MDX', async () => {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(await run(compileSync('{/*!*/}')))
      ),
      ''
    )
  })

  await t.test('should support JSX attribute names', async () => {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(
          await run(compileSync('<x a="1" b:c="1" hidden />'))
        )
      ),
      '<x a="1" b:c="1" hidden=""></x>'
    )
  })

  await t.test('should support JSX attribute values', async () => {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(
          await run(compileSync('<x y="1" z=\'w\' style={{color: "red"}} />'))
        )
      ),
      '<x y="1" z="w" style="color:red"></x>'
    )
  })

  await t.test('should support JSX spread attributes', async () => {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(await run(compileSync('<x {...{a: 1}} />')))
      ),
      '<x a="1"></x>'
    )
  })

  await t.test('should support JSX in expressions', async () => {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(
          await run(compileSync('{<i>the sum of one and one is: {1 + 1}</i>}'))
        )
      ),
      '<i>the sum of one and one is: 2</i>'
    )
  })

  await t.test('should support JSX in expressions', () => {
    // Important: there should not be whitespace in the `tr`.
    // This is normally not present, but unraveling makes this a bit more complex.
    // See: <https://github.com/mdx-js/mdx/issues/2000>.
    assert.equal(
      compileSync(`<table>
  <thead>
    <tr>
      <th>a</th>
      <th>b</th>
    </tr>
  </thead>
</table>`).value,
      [
        '/*@jsxRuntime automatic @jsxImportSource react*/',
        'import {jsx as _jsx, jsxs as _jsxs} from "react/jsx-runtime";',
        'function _createMdxContent(props) {',
        '  return _jsx("table", {',
        '    children: _jsx("thead", {',
        '      children: _jsxs("tr", {',
        '        children: [_jsx("th", {',
        '          children: "a"',
        '        }), _jsx("th", {',
        '          children: "b"',
        '        })]',
        '      })',
        '    })',
        '  });',
        '}',
        'function MDXContent(props = {}) {',
        '  const {wrapper: MDXLayout} = props.components || ({});',
        '  return MDXLayout ? _jsx(MDXLayout, Object.assign({}, props, {',
        '    children: _jsx(_createMdxContent, props)',
        '  })) : _createMdxContent(props);',
        '}',
        'export default MDXContent;',
        ''
      ].join('\n')
    )
  })
})

test('MDX (ESM)', async (t) => {
  await t.test('should support importing components w/ ESM', async () => {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(
          await run(
            compileSync(
              'import {Pill} from "./components.js"\n\n<Pill>!</Pill>'
            )
          )
        )
      ),
      '<span style="color:red">!</span>'
    )
  })

  await t.test('should support importing data w/ ESM', async () => {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(
          await run(compileSync('import {number} from "./data.js"\n\n{number}'))
        )
      ),
      '3.14'
    )
  })

  await t.test('should support exporting w/ ESM', async () => {
    assert.equal(
      (await runWhole(compileSync('export const number = Math.PI'))).number,
      Math.PI
    )
  })

  await t.test(
    'should support exporting an identifier w/o a value',
    async () => {
      assert.ok('a' in (await runWhole(compileSync('export var a'))))
    }
  )

  await t.test('should support exporting an object pattern', async () => {
    assert.equal(
      (
        await runWhole(
          compileSync(
            'import {object} from "./data.js"\nexport var {a} = object'
          )
        )
      ).a,
      1
    )
  })

  await t.test(
    'should support exporting a rest element in an object pattern',
    async () => {
      assert.deepEqual(
        (
          await runWhole(
            compileSync(
              'import {object} from "./data.js"\nexport var {a, ...rest} = object'
            )
          )
        ).rest,
        {b: 2}
      )
    }
  )

  await t.test(
    'should support exporting an assignment pattern in an object pattern',
    async () => {
      assert.equal(
        (
          await runWhole(
            compileSync(
              'import {object} from "./data.js"\nexport var {c = 3} = object'
            )
          )
        ).c,
        3
      )
    }
  )

  await t.test('should support exporting an array pattern', async () => {
    assert.equal(
      (
        await runWhole(
          compileSync('import {array} from "./data.js"\nexport var [a] = array')
        )
      ).a,
      1
    )
  })

  await t.test('should support `export as` w/ ESM', async () => {
    assert.equal(
      (
        await runWhole(
          compileSync('export const number = Math.PI\nexport {number as pi}')
        )
      ).pi,
      Math.PI
    )
  })

  await t.test('should support default export to define a layout', async () => {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(
          await run(
            compileSync(
              'export default function Layout(props) { return <div {...props} /> }\n\na'
            )
          )
        )
      ),
      '<div><p>a</p></div>'
    )
  })

  await t.test('should support default export from a source', async () => {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(
          await run(
            compileSync(
              'export {Layout as default} from "./components.js"\n\na'
            )
          )
        )
      ),
      '<div style="color:red"><p>a</p></div>'
    )
  })

  await t.test(
    'should support rexporting something as a default export from a source',
    async () => {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(
            await run(
              compileSync('export {default} from "./components.js"\n\na')
            )
          )
        ),
        '<div style="color:red"><p>a</p></div>'
      )
    }
  )

  await t.test(
    'should support rexporting the default export from a source',
    async () => {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(
            await run(
              compileSync('export {default} from "./components.js"\n\na')
            )
          )
        ),
        '<div style="color:red"><p>a</p></div>'
      )
    }
  )

  await t.test(
    'should support rexporting the default export from a source',
    async () => {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(
            await run(
              compileSync('export {default} from "./components.js"\n\na')
            )
          )
        ),
        '<div style="color:red"><p>a</p></div>'
      )
    }
  )

  await t.test(
    'should support rexporting the default export, and other things, from a source',
    async () => {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(
            await run(
              compileSync('export {default, Pill} from "./components.js"\n\na')
            )
          )
        ),
        '<div style="color:red"><p>a</p></div>'
      )
    }
  )

  await t.test('should support the jsx dev runtime', async () => {
    assert.equal(
      compileSync(
        {value: '<X />', path: 'path/to/file.js'},
        {development: true}
      ).value,
      [
        '/*@jsxRuntime automatic @jsxImportSource react*/',
        'import {jsxDEV as _jsxDEV} from "react/jsx-dev-runtime";',
        'function _createMdxContent(props) {',
        '  const {X} = props.components || ({});',
        '  if (!X) _missingMdxReference("X", true, "1:1-1:6");',
        '  return _jsxDEV(X, {}, undefined, false, {',
        '    fileName: "path/to/file.js",',
        '    lineNumber: 1,',
        '    columnNumber: 1',
        '  }, this);',
        '}',
        'function MDXContent(props = {}) {',
        '  const {wrapper: MDXLayout} = props.components || ({});',
        '  return MDXLayout ? _jsxDEV(MDXLayout, Object.assign({}, props, {',
        '    children: _jsxDEV(_createMdxContent, props, undefined, false, {',
        '      fileName: "path/to/file.js"',
        '    }, this)',
        '  }), undefined, false, {',
        '    fileName: "path/to/file.js"',
        '  }, this) : _createMdxContent(props);',
        '}',
        'export default MDXContent;',
        'function _missingMdxReference(id, component, place) {',
        '  throw new Error("Expected " + (component ? "component" : "object") + " `" + id + "` to be defined: you likely forgot to import, pass, or provide it." + (place ? "\\nIt’s referenced in your code at `" + place + "` in `path/to/file.js`" : ""));',
        '}',
        ''
      ].join('\n')
    )
  })
})

test('source maps', async () => {
  const base = path.resolve(path.join('test', 'context'))
  const file = await compile(
    'export function Component() {\n  a()\n}\n\n<Component />',
    {SourceMapGenerator}
  )

  file.value +=
    '\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,' +
    Buffer.from(JSON.stringify(file.map)).toString('base64') +
    '\n'

  await fs.writeFile(path.join(base, 'sourcemap.js'), String(file))

  const Content = /** @type {MDXContent} */ (
    /* @ts-ignore file is dynamically generated */
    (await import('./context/sourcemap.js')).default // type-coverage:ignore-line
  )

  assert.throws(
    () => {
      renderToStaticMarkup(React.createElement(Content))
    },
    (error) => {
      const exception = /** @type {Error} */ (error)
      const match = /at Component \(file:([^)]+)\)/.exec(
        String(exception.stack)
      )
      const place =
        path.posix.join(...base.split(path.sep), 'unknown.mdx') + ':2:3'

      return place === match?.[1].slice(-place.length)
    },
    'should support source maps'
  )

  await fs.unlink(path.join(base, 'sourcemap.js'))
})

/**
 *
 * @param {VFileCompatible} input
 * @return {Promise<MDXContent>}
 */
async function run(input) {
  return (await runWhole(input)).default
}

/**
 *
 * @param {VFileCompatible} input
 * @return {Promise<MDXModule>}
 */
async function runWhole(input) {
  const name = 'fixture-' + nanoid().toLowerCase() + '.js'
  const fp = path.join('test', 'context', name)
  const doc = String(input)

  await fs.writeFile(fp, doc)

  try {
    /** @type {MDXModule} */
    return await import('./context/' + name)
  } finally {
    // This is not a bug: the `finally` runs after the whole `try` block, but
    // before the `return`.
    await fs.unlink(fp)
  }
}
