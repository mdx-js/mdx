/**
 * @typedef {import('mdx/types').MDXModule} MDXModule
 * @typedef {import('mdx/types').MDXContent} MDXContent
 * @typedef {import('hast').Root} Root
 * @typedef {import('../lib/compile.js').VFileCompatible} VFileCompatible
 */

import {Buffer} from 'buffer'
import {promises as fs} from 'fs'
import path from 'path'
import {test} from 'uvu'
import * as assert from 'uvu/assert'
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
import {compile, compileSync, createProcessor, nodeTypes} from '../index.js'
// @ts-expect-error: make sure a single react is used.
import {renderToStaticMarkup as renderToStaticMarkup_} from '../../react/node_modules/react-dom/server.js'
import {MDXProvider} from '../../react/index.js'

// Note: Node has an experimental `--enable-source-maps` flag, but most of V8
// doesn’t seem to support it.
// So instead use a userland module.
import 'source-map-support/register.js'

/** @type {import('react-dom/server').renderToStaticMarkup} */
const renderToStaticMarkup = renderToStaticMarkup_

test('compile', async () => {
  try {
    // @ts-expect-error: removed option.
    await compile('# hi!', {filepath: 'example.mdx'})
    assert.unreachable()
  } catch (/** @type {unknown} */ error) {
    const exception = /** @type {Error} */ (error)
    assert.match(
      exception.message,
      /`options.filepath` is no longer supported/,
      'should throw when a removed option is passed'
    )
  }

  assert.equal(
    renderToStaticMarkup(
      React.createElement(await run(await compile('# hi!')))
    ),
    '<h1>hi!</h1>',
    'should compile'
  )

  assert.equal(
    renderToStaticMarkup(
      React.createElement(await run(await compile(new VFile('# hi?'))))
    ),
    '<h1>hi?</h1>',
    'should compile a vfile'
  )

  assert.equal(
    renderToStaticMarkup(React.createElement(await run(compileSync('# hi!')))),
    '<h1>hi!</h1>',
    'should compile (sync)'
  )

  assert.equal(
    renderToStaticMarkup(React.createElement(await run(compileSync('')))),
    '',
    'should compile an empty document'
  )

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
    '',
    'should compile an empty document (remark)'
  )

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
    '',
    'should compile an empty document (rehype)'
  )

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
    '',
    'should compile a document (rehype, non-representable)'
  )

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
    '<x></x>',
    'should compile a non-element document (rehype, single element)'
  )

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
    '<a-b></a-b>',
    'should compile custom elements'
  )

  assert.equal(
    renderToStaticMarkup(
      React.createElement(
        await run(compileSync('!', {jsxRuntime: 'automatic'}))
      )
    ),
    '<p>!</p>',
    'should support the automatic runtime (`@jsxRuntime`)'
  )

  assert.equal(
    render(
      h(await run(compileSync('?', {jsxImportSource: 'preact/compat'})), {})
    ),
    '<p>?</p>',
    'should support an import source (`@jsxImportSource`)'
  )

  assert.equal(
    render(
      h(
        await run(
          compileSync('<>%</>', {
            jsxRuntime: 'classic',
            pragma: 'preact.createElement',
            pragmaFrag: 'preact.Fragment',
            pragmaImportSource: 'preact/compat'
          })
        ),
        {}
      )
    ),
    '%',
    'should support `pragma`, `pragmaFrag` for `preact/compat`'
  )

  assert.equal(
    render(
      h(await run(compileSync('<>1</>', {jsxImportSource: 'preact'})), {})
    ),
    '1',
    'should support `jsxImportSource` for `preact`'
  )

  assert.equal(
    renderToStaticMarkup(
      React.createElement(
        await run(
          String(compileSync('<>+</>', {jsxImportSource: '@emotion/react'}))
        )
      )
    ),
    '+',
    'should support `jsxImportSource` for `emotion`'
  )

  assert.throws(
    () => {
      compileSync('import React from "react"\n\n.', {
        jsxRuntime: 'classic',
        pragmaImportSource: '@emotion/react',
        pragma: ''
      })
    },
    /Missing `pragma` in classic runtime with `pragmaImportSource`/,
    'should *not* support `jsxClassicImportSource` w/o `pragma`'
  )

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
    '<span>!</span>',
    'should support passing in `components` to `MDXContent`'
  )

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
    '<span>?</span>',
    'should support passing in `components` (for members) to `MDXContent`'
  )

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
    '<p><span>!</span> and <span>?</span></p>',
    'should support passing in `components` directly and as an object w/ members'
  )

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
    '<p><i>a</i></p>',
    'should support overwriting components by passing them to `MDXContent`'
  )

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
    '<p><i>a</i>, <em>a</em></p>',
    'should *not* support overwriting components in exports'
  )

  try {
    renderToStaticMarkup(
      React.createElement(
        await run(compileSync('export var X = () => <Y />\n\n<X />'))
      )
    )
    assert.unreachable()
  } catch (/** @type {unknown} */ error) {
    const exception = /** @type {Error} */ (error)
    assert.match(
      exception.message,
      /Y is not defined/,
      'should throw on missing components in exported components'
    )
  }

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
    '<span>!</span>',
    'should support provided components in exported components'
  )

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
    '<div>a</div>',
    'should support custom components in exported components'
  )

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
    '<span>!</span>',
    'should support provided component objects in exported components'
  )

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
    '<div><p>a</p></div>',
    'should support setting the layout by passing it (as `wrapper`) to `MDXContent`'
  )

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
    '<p>a</p>',
    'should support setting the layout through a class component'
  )

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
    '<section><p>a</p></section>',
    'should *not* support overwriting the layout by passing one (as `wrapper`) to `MDXContent`'
  )

  assert.throws(
    () => {
      compileSync(
        'export default function a() {}\n\nexport default function b() {}\n\n.'
      )
    },
    /Cannot specify multiple layouts \(previous: 1:1-1:31\)/,
    'should *not* support multiple layouts (1)'
  )

  assert.throws(
    () => {
      compileSync(
        'export default function a() {}\n\nexport {Layout as default} from "./components.js"\n\n.'
      )
    },
    /Cannot specify multiple layouts \(previous: 1:1-1:31\)/,
    'should *not* support multiple layouts (2)'
  )

  try {
    renderToStaticMarkup(
      React.createElement(await run(compileSync('export default a')))
    )
    assert.unreachable()
  } catch (/** @type {unknown} */ error) {
    const exception = /** @type {Error} */ (error)
    assert.equal(
      exception.message,
      'a is not defined',
      'should support an identifier as an export default'
    )
  }

  try {
    renderToStaticMarkup(React.createElement(await run(compileSync('<X />'))))
    assert.unreachable()
  } catch (/** @type {unknown} */ error) {
    const exception = /** @type {Error} */ (error)
    assert.match(
      exception.message,
      /Expected component `X` to be defined/,
      'should throw if a required component is not passed'
    )
  }

  try {
    renderToStaticMarkup(React.createElement(await run(compileSync('<a.b />'))))
    assert.unreachable()
  } catch (/** @type {unknown} */ error) {
    const exception = /** @type {Error} */ (error)
    assert.match(
      exception.message,
      /Expected object `a` to be defined/,
      'should throw if a required member is not passed'
    )
  }

  try {
    renderToStaticMarkup(
      React.createElement(
        await run(compileSync('export const a = {}\n\n<a.b />'))
      )
    )
    assert.unreachable()
  } catch (/** @type {unknown} */ error) {
    const exception = /** @type {Error} */ (error)
    assert.match(
      exception.message,
      /Expected component `a.b` to be defined/,
      'should throw if a used member is not defined locally'
    )
  }

  try {
    renderToStaticMarkup(
      React.createElement(
        await run(compileSync('<a render={() => <x.y />} />'))
      )
    )
    assert.unreachable()
  } catch (/** @type {unknown} */ error) {
    const exception = /** @type {Error} */ (error)
    assert.match(
      exception.message,
      /Expected object `x` to be defined/,
      'should throw if a used member is not defined locally (JSX in a function)'
    )
  }

  console.log('\nnote: the following warning is expected!\n')
  assert.equal(
    renderToStaticMarkup(
      React.createElement(
        await run(compileSync('<a render={(x) => <x.y />} />'))
      )
    ),
    '<a></a>',
    'should render if a used member is defined locally (JSX in a function)'
  )
  console.log('\nnote: the preceding warning is expected!\n')

  try {
    renderToStaticMarkup(
      React.createElement(await run(compileSync('<X />', {development: true})))
    )
    assert.unreachable()
  } catch (/** @type {unknown} */ error) {
    const exception = /** @type {Error} */ (error)
    assert.match(
      exception.message,
      /It’s referenced in your code at `1:1-1:6/,
      'should pass more info to errors w/ `development: true`'
    )
  }

  try {
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
    assert.unreachable()
  } catch (/** @type {unknown} */ error) {
    const exception = /** @type {Error} */ (error)
    assert.match(
      exception.message,
      /It’s referenced in your code at `1:5-1:12` in `folder\/example.mdx`/,
      'should show what file contains the error w/ `development: true`, and `path`'
    )
  }

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
          await run(compileSync('*z*', {providerImportSource: '@mdx-js/react'}))
        )
      )
    ),
    '<p><i>z</i></p>',
    'should support setting components through context with a `providerImportSource`'
  )

  try {
    renderToStaticMarkup(
      React.createElement(
        await run(compileSync('<X />', {providerImportSource: '@mdx-js/react'}))
      )
    )
    assert.unreachable()
  } catch (/** @type {unknown} */ error) {
    const exception = /** @type {Error} */ (error)
    assert.match(
      exception.message,
      /Expected component `X` to be defined/,
      'should throw if a required component is not passed or given to `MDXProvider`'
    )
  }

  assert.equal(
    renderToStaticMarkup(
      React.createElement(await run(createProcessor().processSync('x')))
    ),
    '<p>x</p>',
    'should support `createProcessor`'
  )

  assert.equal(
    renderToStaticMarkup(
      React.createElement(
        await run(createProcessor({format: 'md'}).processSync('\tx'))
      )
    ),
    '<pre><code>x\n</code></pre>',
    'should support `format: md`'
  )

  assert.equal(
    renderToStaticMarkup(
      React.createElement(
        await run(createProcessor({format: 'mdx'}).processSync('\tx'))
      )
    ),
    '<p>x</p>',
    'should support `format: mdx`'
  )

  try {
    // @ts-expect-error incorrect `detect`.
    createProcessor({format: 'detect'})
    assert.unreachable()
  } catch (/** @type {unknown} */ error) {
    const exception = /** @type {Error} */ (error)
    assert.equal(
      exception.message,
      "Incorrect `format: 'detect'`: `createProcessor` can support either `md` or `mdx`; it does not support detecting the format",
      'should not support `format: detect`'
    )
  }

  assert.equal(
    renderToStaticMarkup(
      React.createElement(await run(await compile({value: '\tx'})))
    ),
    '<p>x</p>',
    'should detect as `mdx` by default'
  )

  assert.equal(
    renderToStaticMarkup(
      React.createElement(
        await run(await compile({value: '\tx', path: 'y.md'}))
      )
    ),
    '<pre><code>x\n</code></pre>',
    'should detect `.md` as `md`'
  )

  assert.equal(
    renderToStaticMarkup(
      React.createElement(
        await run(await compile({value: '\tx', path: 'y.mdx'}))
      )
    ),
    '<p>x</p>',
    'should detect `.mdx` as `mdx`'
  )

  assert.equal(
    renderToStaticMarkup(
      React.createElement(
        await run(await compile({value: '\tx', path: 'y.md'}, {format: 'mdx'}))
      )
    ),
    '<p>x</p>',
    'should not “detect” `.md` w/ `format: mdx`'
  )

  assert.equal(
    renderToStaticMarkup(
      React.createElement(
        await run(await compile({value: '\tx', path: 'y.mdx'}, {format: 'md'}))
      )
    ),
    '<pre><code>x\n</code></pre>',
    'should not “detect” `.mdx` w/ `format: md`'
  )

  assert.equal(
    renderToStaticMarkup(
      React.createElement(
        await run(await compile({value: '<q>r</q>', path: 's.md'}))
      )
    ),
    '<p>r</p>',
    'should not support HTML in markdown by default'
  )

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
    '<p><q>r</q></p>',
    'should support HTML in markdown w/ `rehype-raw`'
  )

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
    /var a = 1/,
    'should support injected MDX nodes w/ `rehype-raw`'
  )
})

test('jsx', async () => {
  assert.equal(
    String(compileSync('*a*', {jsx: true})),
    [
      '/*@jsxRuntime automatic @jsxImportSource react*/',
      'function _createMdxContent(props) {',
      '  const _components = Object.assign({',
      '    p: "p",',
      '    em: "em"',
      '  }, props.components);',
      '  return <_components.p><_components.em>{"a"}</_components.em></_components.p>;',
      '}',
      'function MDXContent(props = {}) {',
      '  const {wrapper: MDXLayout} = props.components || ({});',
      '  return MDXLayout ? <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout> : _createMdxContent(props);',
      '}',
      'export default MDXContent;',
      ''
    ].join('\n'),
    'should serialize JSX w/ `jsx: true`'
  )

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
    ].join('\n'),
    'should serialize props'
  )

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
    ].join('\n'),
    'should serialize fragments, namespaces, members'
  )

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
    ].join('\n'),
    'should serialize fragments, expressions'
  )

  assert.equal(
    String(compileSync('{<a-b></a-b>}', {jsx: true})),
    [
      '/*@jsxRuntime automatic @jsxImportSource react*/',
      'function _createMdxContent(props) {',
      '  const _components = Object.assign({',
      '    "a-b": "a-b"',
      '  }, props.components), _component0 = _components["a-b"];',
      '  return <>{<_component0></_component0>}</>;',
      '}',
      'function MDXContent(props = {}) {',
      '  const {wrapper: MDXLayout} = props.components || ({});',
      '  return MDXLayout ? <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout> : _createMdxContent(props);',
      '}',
      'export default MDXContent;',
      ''
    ].join('\n'),
    'should serialize custom elements inside expressions'
  )

  assert.equal(
    String(compileSync('Hello {props.name}', {jsx: true})),
    [
      '/*@jsxRuntime automatic @jsxImportSource react*/',
      'function _createMdxContent(props) {',
      '  const _components = Object.assign({',
      '    p: "p"',
      '  }, props.components);',
      '  return <_components.p>{"Hello "}{props.name}</_components.p>;',
      '}',
      'function MDXContent(props = {}) {',
      '  const {wrapper: MDXLayout} = props.components || ({});',
      '  return MDXLayout ? <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout> : _createMdxContent(props);',
      '}',
      'export default MDXContent;',
      ''
    ].join('\n'),
    'should allow using props'
  )

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
      '  const _components = Object.assign({',
      '    p: "p"',
      '  }, props.components);',
      '  return <_components.p>{"a"}</_components.p>;',
      '}',
      'function MDXContent(props = {}) {',
      '  return <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout>;',
      '}',
      'export default MDXContent;',
      ''
    ].join('\n'),
    'should not have a conditional expression for MDXLayout when there is an internal layout'
  )

  assert.match(
    String(compileSync("{<w x='y \" z' />}", {jsx: true})),
    /x="y &quot; z"/,
    'should serialize double quotes in attribute values'
  )

  assert.match(
    String(compileSync('{<>a &amp; b &#123; c &lt; d</>}', {jsx: true})),
    /a & b &#123; c &lt; d/,
    'should serialize `<` and `{` in JSX text'
  )
})

test('markdown (CM)', async () => {
  assert.equal(
    renderToStaticMarkup(React.createElement(await run(compileSync('[a](b)')))),
    '<p><a href="b">a</a></p>',
    'should support links (resource) (`[]()` -> `a`)'
  )

  assert.equal(
    renderToStaticMarkup(
      React.createElement(await run(compileSync('[a]: b\n[a]')))
    ),
    '<p><a href="b">a</a></p>',
    'should support links (reference) (`[][]` -> `a`)'
  )

  assert.throws(
    () => {
      compileSync('<http://a>')
    },
    /note: to create a link in MDX, use `\[text]\(url\)/,
    'should *not* support links (autolink) (`<http://a>` -> error)'
  )

  assert.equal(
    renderToStaticMarkup(React.createElement(await run(compileSync('> a')))),
    '<blockquote>\n<p>a</p>\n</blockquote>',
    'should support block quotes (`>` -> `blockquote`)'
  )

  assert.equal(
    renderToStaticMarkup(React.createElement(await run(compileSync('\\*a*')))),
    '<p>*a*</p>',
    'should support characters (escape) (`\\` -> ``)'
  )

  assert.equal(
    renderToStaticMarkup(React.createElement(await run(compileSync('&lt;')))),
    '<p>&lt;</p>',
    'should support character (reference) (`&lt;` -> `<`)'
  )

  assert.equal(
    renderToStaticMarkup(React.createElement(await run(compileSync('```\na')))),
    '<pre><code>a\n</code></pre>',
    'should support code (fenced) (` ``` ` -> `pre code`)'
  )

  assert.equal(
    renderToStaticMarkup(React.createElement(await run(compileSync('    a')))),
    '<p>a</p>',
    'should *not* support code (indented) (`\\ta` -> `p`)'
  )

  assert.equal(
    renderToStaticMarkup(React.createElement(await run(compileSync('`a`')))),
    '<p><code>a</code></p>',
    'should support code (text) (`` `a` `` -> `code`)'
  )

  assert.equal(
    renderToStaticMarkup(React.createElement(await run(compileSync('*a*')))),
    '<p><em>a</em></p>',
    'should support emphasis (`*` -> `em`)'
  )

  assert.equal(
    renderToStaticMarkup(React.createElement(await run(compileSync('a\\\nb')))),
    '<p>a<br/>\nb</p>',
    'should support hard break (escape) (`\\\\\\n` -> `<br>`)'
  )

  assert.equal(
    renderToStaticMarkup(React.createElement(await run(compileSync('a  \nb')))),
    '<p>a<br/>\nb</p>',
    'should support hard break (whitespace) (`\\\\\\n` -> `<br>`)'
  )

  assert.equal(
    renderToStaticMarkup(React.createElement(await run(compileSync('#')))),
    '<h1></h1>',
    'should support headings (atx) (`#` -> `<h1>`)'
  )

  assert.equal(
    renderToStaticMarkup(React.createElement(await run(compileSync('a\n=')))),
    '<h1>a</h1>',
    'should support headings (setext) (`=` -> `<h1>`)'
  )

  assert.equal(
    renderToStaticMarkup(React.createElement(await run(compileSync('1.')))),
    '<ol>\n<li></li>\n</ol>',
    'should support list (ordered) (`1.` -> `<ol><li>`)'
  )

  assert.equal(
    renderToStaticMarkup(React.createElement(await run(compileSync('*')))),
    '<ul>\n<li></li>\n</ul>',
    'should support list (unordered) (`*` -> `<ul><li>`)'
  )

  assert.equal(
    renderToStaticMarkup(React.createElement(await run(compileSync('**a**')))),
    '<p><strong>a</strong></p>',
    'should support strong (`**` -> `strong`)'
  )

  assert.equal(
    renderToStaticMarkup(React.createElement(await run(compileSync('***')))),
    '<hr/>',
    'should support thematic break (`***` -> `<hr>`)'
  )
})

test('markdown (GFM, with `remark-gfm`)', async () => {
  assert.equal(
    renderToStaticMarkup(
      React.createElement(
        await run(compileSync('http://a', {remarkPlugins: [remarkGfm]}))
      )
    ),
    '<p><a href="http://a">http://a</a></p>',
    'should support links (autolink literal) (`http://a` -> `a`)'
  )

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
</section>`,
    'should support footnotes (`[^a]` -> `<sup><a…>`)'
  )

  assert.equal(
    renderToStaticMarkup(
      React.createElement(
        await run(compileSync('| a |\n| - |', {remarkPlugins: [remarkGfm]}))
      )
    ),
    '<table><thead><tr><th>a</th></tr></thead></table>',
    'should support tables (`| a |` -> `<table>...`)'
  )

  assert.equal(
    renderToStaticMarkup(
      React.createElement(
        await run(compileSync('* [x] a\n* [ ] b', {remarkPlugins: [remarkGfm]}))
      )
    ),
    '<ul class="contains-task-list">\n<li class="task-list-item"><input type="checkbox" disabled="" checked=""/> a</li>\n<li class="task-list-item"><input type="checkbox" disabled=""/> b</li>\n</ul>',
    'should support task lists (`* [x]` -> `input`)'
  )

  assert.equal(
    renderToStaticMarkup(
      React.createElement(
        await run(compileSync('~a~', {remarkPlugins: [remarkGfm]}))
      )
    ),
    '<p><del>a</del></p>',
    'should support strikethrough (`~` -> `del`)'
  )
})

test('markdown (frontmatter, `remark-frontmatter`)', async () => {
  assert.equal(
    renderToStaticMarkup(
      React.createElement(
        await run(
          compileSync('---\na: b\n---\nc', {remarkPlugins: [remarkFrontmatter]})
        )
      )
    ),
    '<p>c</p>',
    'should support frontmatter (YAML)'
  )

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
    '<p>c</p>',
    'should support frontmatter (TOML)'
  )
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

test('MDX (JSX)', async () => {
  assert.equal(
    renderToStaticMarkup(
      React.createElement(await run(compileSync('a <s>b</s>')))
    ),
    '<p>a <s>b</s></p>',
    'should support JSX (text)'
  )

  assert.equal(
    renderToStaticMarkup(
      React.createElement(await run(compileSync('<div>\n  b\n</div>')))
    ),
    '<div><p>b</p></div>',
    'should support JSX (flow)'
  )

  assert.equal(
    renderToStaticMarkup(
      React.createElement(await run(compileSync('<h1>b</h1>')))
    ),
    '<h1>b</h1>',
    'should unravel JSX (text) as an only child'
  )

  assert.equal(
    renderToStaticMarkup(
      React.createElement(await run(compileSync('<a>b</a><b>c</b>')))
    ),
    '<a>b</a>\n<b>c</b>',
    'should unravel JSX (text) as only children'
  )

  assert.equal(
    renderToStaticMarkup(
      React.createElement(await run(compileSync('<a>b</a>\t<b>c</b>')))
    ),
    '<a>b</a>\n\t\n<b>c</b>',
    'should unravel JSX (text) and whitespace as only children'
  )

  assert.equal(
    renderToStaticMarkup(React.createElement(await run(compileSync('{1}')))),
    '1',
    'should unravel expression (text) as an only child'
  )

  assert.equal(
    renderToStaticMarkup(React.createElement(await run(compileSync('{1}{2}')))),
    '1\n2',
    'should unravel expression (text) as only children'
  )

  assert.equal(
    renderToStaticMarkup(
      React.createElement(await run(compileSync('{1}\n{2}')))
    ),
    '1\n2',
    'should unravel expression (text) and whitespace as only children'
  )

  assert.equal(
    renderToStaticMarkup(
      React.createElement(await run(compileSync('a <>b</>')))
    ),
    '<p>a b</p>',
    'should support JSX (text, fragment)'
  )

  assert.equal(
    renderToStaticMarkup(
      React.createElement(await run(compileSync('<>\n  b\n</>')))
    ),
    '<p>b</p>',
    'should support JSX (flow, fragment)'
  )

  assert.equal(
    renderToStaticMarkup(
      React.createElement(await run(compileSync('a <x:y>b</x:y>')))
    ),
    '<p>a <x:y>b</x:y></p>',
    'should support JSX (namespace)'
  )

  assert.equal(
    renderToStaticMarkup(
      React.createElement(await run(compileSync('export const a = 1\n\na {a}')))
    ),
    '<p>a 1</p>',
    'should support expressions in MDX (text)'
  )

  assert.equal(
    renderToStaticMarkup(
      React.createElement(await run(compileSync('{\n  1 + 1\n}')))
    ),
    '2',
    'should support expressions in MDX (flow)'
  )

  assert.equal(
    renderToStaticMarkup(
      React.createElement(await run(compileSync('{/*!*/}')))
    ),
    '',
    'should support empty expressions in MDX'
  )

  assert.equal(
    renderToStaticMarkup(
      React.createElement(await run(compileSync('<x a="1" b:c="1" hidden />')))
    ),
    '<x a="1" b:c="1" hidden=""></x>',
    'should support JSX attribute names'
  )

  assert.equal(
    renderToStaticMarkup(
      React.createElement(
        await run(compileSync('<x y="1" z=\'w\' style={{color: "red"}} />'))
      )
    ),
    '<x y="1" z="w" style="color:red"></x>',
    'should support JSX attribute values'
  )

  assert.equal(
    renderToStaticMarkup(
      React.createElement(await run(compileSync('<x {...{a: 1}} />')))
    ),
    '<x a="1"></x>',
    'should support JSX spread attributes'
  )

  assert.equal(
    renderToStaticMarkup(
      React.createElement(
        await run(compileSync('{<i>the sum of one and one is: {1 + 1}</i>}'))
      )
    ),
    '<i>the sum of one and one is: 2</i>',
    'should support JSX in expressions'
  )
})

test('MDX (ESM)', async () => {
  assert.equal(
    renderToStaticMarkup(
      React.createElement(
        await run(
          compileSync('import {Pill} from "./components.js"\n\n<Pill>!</Pill>')
        )
      )
    ),
    '<span style="color:red">!</span>',
    'should support importing components w/ ESM'
  )

  assert.equal(
    renderToStaticMarkup(
      React.createElement(
        await run(compileSync('import {number} from "./data.js"\n\n{number}'))
      )
    ),
    '3.14',
    'should support importing data w/ ESM'
  )

  assert.equal(
    (await runWhole(compileSync('export const number = Math.PI'))).number,
    Math.PI,
    'should support exporting w/ ESM'
  )

  assert.ok(
    'a' in (await runWhole(compileSync('export var a'))),
    'should support exporting an identifier w/o a value'
  )

  assert.equal(
    (
      await runWhole(
        compileSync('import {object} from "./data.js"\nexport var {a} = object')
      )
    ).a,
    1,
    'should support exporting an object pattern'
  )

  assert.equal(
    (
      await runWhole(
        compileSync(
          'import {object} from "./data.js"\nexport var {a, ...rest} = object'
        )
      )
    ).rest,
    {b: 2},
    'should support exporting a rest element in an object pattern'
  )

  assert.equal(
    (
      await runWhole(
        compileSync(
          'import {object} from "./data.js"\nexport var {c = 3} = object'
        )
      )
    ).c,
    3,
    'should support exporting an assignment pattern in an object pattern'
  )

  assert.equal(
    (
      await runWhole(
        compileSync('import {array} from "./data.js"\nexport var [a] = array')
      )
    ).a,
    1,
    'should support exporting an array pattern'
  )

  assert.equal(
    (
      await runWhole(
        compileSync('export const number = Math.PI\nexport {number as pi}')
      )
    ).pi,
    Math.PI,
    'should support `export as` w/ ESM'
  )

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
    '<div><p>a</p></div>',
    'should support default export to define a layout'
  )

  assert.equal(
    renderToStaticMarkup(
      React.createElement(
        await run(
          compileSync('export {Layout as default} from "./components.js"\n\na')
        )
      )
    ),
    '<div style="color:red"><p>a</p></div>',
    'should support default export from a source'
  )

  assert.equal(
    renderToStaticMarkup(
      React.createElement(
        await run(compileSync('export {default} from "./components.js"\n\na'))
      )
    ),
    '<div style="color:red"><p>a</p></div>',
    'should support rexporting something as a default export from a source'
  )

  assert.equal(
    renderToStaticMarkup(
      React.createElement(
        await run(compileSync('export {default} from "./components.js"\n\na'))
      )
    ),
    '<div style="color:red"><p>a</p></div>',
    'should support rexporting the default export from a source'
  )

  assert.equal(
    renderToStaticMarkup(
      React.createElement(
        await run(compileSync('export {default} from "./components.js"\n\na'))
      )
    ),
    '<div style="color:red"><p>a</p></div>',
    'should support rexporting the default export from a source'
  )

  assert.equal(
    renderToStaticMarkup(
      React.createElement(
        await run(
          compileSync('export {default, Pill} from "./components.js"\n\na')
        )
      )
    ),
    '<div style="color:red"><p>a</p></div>',
    'should support rexporting the default export, and other things, from a source'
  )
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
    /* @ts-expect-error file is dynamically generated */
    (await import('./context/sourcemap.js')).default // type-coverage:ignore-line
  )

  try {
    renderToStaticMarkup(React.createElement(Content))
    assert.unreachable()
  } catch (error) {
    const exception = /** @type {Error} */ (error)
    const match = /at Component \(file:([^)]+)\)/.exec(String(exception.stack))
    const place =
      path.posix.join(...base.split(path.sep), 'unknown.mdx') + ':2:3'

    assert.equal(
      match && match[1].slice(-place.length),
      place,
      'should support source maps'
    )
  }

  await fs.unlink(path.join(base, 'sourcemap.js'))
})

test.run()

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
