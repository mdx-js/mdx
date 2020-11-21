const path = require('path')
const babel = require('@babel/core')
const unified = require('unified')
const React = require('react')
const {renderToStaticMarkup} = require('react-dom/server')
const {mdx: mdxReact, MDXProvider} = require('../../react')
const mdx = require('..')
const toMdxHast = require('../mdx-ast-to-mdx-hast')
const toJsx = require('../mdx-hast-to-jsx')
const footnotes = require('remark-footnotes')
const math = require('remark-math')
const katex = require('rehype-katex')

const run = async (value, options = {}) => {
  const doc = await mdx(value, {...options, skipExport: true})

  // …and that into serialized JS.
  const {code} = await babel.transformAsync(doc, {
    configFile: false,
    plugins: [
      '@babel/plugin-transform-react-jsx',
      path.resolve(__dirname, '../../babel-plugin-remove-export-keywords')
    ]
  })

  // …and finally run it, returning the component.
  // eslint-disable-next-line no-new-func
  return new Function('mdx', `${code}; return MDXContent`)(mdxReact)
}

describe('@mdx-js/mdx', () => {
  it('should generate JSX', async () => {
    const result = await mdx('Hello World')

    expect(result).toMatch(/<p>\{`Hello World`\}<\/p>/)
  })

  it('should generate runnable JSX', async () => {
    const Content = await run('Hello World')

    expect(renderToStaticMarkup(<Content />)).toEqual(
      renderToStaticMarkup(<p>Hello World</p>)
    )
  })

  it('should support `&`, `<`, and `>` in text', async () => {
    // Note: we don’t allow `<` in MDX files, but the character reference will
    // get decoded and is present in the AST as `<`.
    const Content = await run('a &lt; b > c & d')

    expect(renderToStaticMarkup(<Content />)).toEqual(
      renderToStaticMarkup(<p>{'a < b > c & d'}</p>)
    )
  })

  it('should support `remarkPlugins` (math)', async () => {
    const Content = await run('$x$', {remarkPlugins: [math]})

    expect(renderToStaticMarkup(<Content />)).toEqual(
      renderToStaticMarkup(
        <p>
          <span className="math math-inline">x</span>
        </p>
      )
    )
  })

  it('should support `remarkPlugins` (footnotes)', async () => {
    const Content = await run('x [^y]\n\n[^y]: z', {remarkPlugins: [footnotes]})

    expect(renderToStaticMarkup(<Content />)).toEqual(
      renderToStaticMarkup(
        <>
          <p>
            x{' '}
            <sup id="fnref-y">
              <a href="#fn-y" className="footnote-ref">
                y
              </a>
            </sup>
          </p>
          <div className="footnotes">
            <hr />
            <ol>
              <li id="fn-y">
                z
                <a href="#fnref-y" className="footnote-backref">
                  ↩
                </a>
              </li>
            </ol>
          </div>
        </>
      )
    )
  })

  it('should support `rehypePlugins`', async () => {
    const Content = await run('$x$', {
      remarkPlugins: [math],
      rehypePlugins: [katex]
    })

    expect(renderToStaticMarkup(<Content />)).toEqual(
      renderToStaticMarkup(
        <p>
          <span className="math math-inline">
            <span className="katex">
              <span className="katex-mathml">
                <math xmlns="http://www.w3.org/1998/Math/MathML">
                  <semantics>
                    <mrow>
                      <mi>x</mi>
                    </mrow>
                    <annotation encoding="application/x-tex">x</annotation>
                  </semantics>
                </math>
              </span>
              <span className="katex-html" aria-hidden="true">
                <span className="base">
                  <span
                    className="strut"
                    style={{height: '0.43056em', verticalAlign: '0em'}}
                  ></span>
                  <span className="mord mathnormal">x</span>
                </span>
              </span>
            </span>
          </span>
        </p>
      )
    )
  })

  it('should support async plugins', async () => {
    const plugin = () => async tree => {
      tree.children[0].children[0].value = 'y'
    }

    const Content = await run('x', {remarkPlugins: [plugin]})

    expect(renderToStaticMarkup(<Content />)).toEqual(
      renderToStaticMarkup(<p>y</p>)
    )
  })

  it('should support `filepath` to set the vfile’s path', async () => {
    const plugin = () => (_, file) => {
      expect(file.path).toEqual('y')
    }

    await run('x', {filepath: 'y', remarkPlugins: [plugin]})
  })

  it('should use an `inlineCode` “element” in mdxhast', async () => {
    expect.assertions(1)

    const plugin = () => tree => {
      expect(tree.children[0].children[0]).toEqual({
        type: 'element',
        tagName: 'inlineCode',
        properties: {},
        children: [{type: 'text', value: 'x'}],
        position: {
          start: {line: 1, column: 1, offset: 0},
          end: {line: 1, column: 4, offset: 3}
        }
      })
    }

    await run('`x`', {rehypePlugins: [plugin]})
  })

  it('should support `pre`/`code` from empty fenced code in mdxhast', async () => {
    const Content = await run('```\n```')

    expect(renderToStaticMarkup(<Content />)).toEqual(
      renderToStaticMarkup(
        <pre>
          <code></code>
        </pre>
      )
    )
  })

  it('should support `pre`/`code` from fenced code in mdxhast', async () => {
    const Content = await run('```\nx\n```')

    expect(renderToStaticMarkup(<Content />)).toEqual(
      renderToStaticMarkup(
        <pre>
          <code>x{'\n'}</code>
        </pre>
      )
    )
  })

  it('should support `pre`/`code` from fenced code w/ lang in mdxhast', async () => {
    const Content = await run('```js\nx\n```')

    expect(renderToStaticMarkup(<Content />)).toEqual(
      renderToStaticMarkup(
        <pre>
          <code className="language-js">x{'\n'}</code>
        </pre>
      )
    )
  })

  it('should support attributes from fenced code meta string in mdxhast', async () => {
    const Content = await run('```js id class=y title=z\nx\n```')
    const error = console.error
    console.error = jest.fn()

    expect(renderToStaticMarkup(<Content />)).toEqual(
      renderToStaticMarkup(
        <pre>
          <code
            className="language-js y"
            metastring="id class=y title=z"
            title="z"
          >
            x{'\n'}
          </code>
        </pre>
      )
    )

    console.error = error
  })

  it('should support a block quote in markdown', async () => {
    const Content = await run('> x\n> `y`')

    expect(renderToStaticMarkup(<Content />)).toEqual(
      renderToStaticMarkup(
        <blockquote>
          <p>
            x{'\n'}
            <code>y</code>
          </p>
        </blockquote>
      )
    )
  })

  it('should support html/jsx inside code in markdown', async () => {
    const Content = await run('`<x>`')

    expect(renderToStaticMarkup(<Content />)).toEqual(
      renderToStaticMarkup(
        <p>
          <code>{'<x>'}</code>
        </p>
      )
    )
  })

  it('should support tables in markdown', async () => {
    const Content = await run('| A | B |\n| :- | -: |\n| a | b |')

    expect(renderToStaticMarkup(<Content />)).toEqual(
      renderToStaticMarkup(
        <table>
          <thead>
            <tr>
              <th align="left">A</th>
              <th align="right">B</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td align="left">a</td>
              <td align="right">b</td>
            </tr>
          </tbody>
        </table>
      )
    )
  })

  it('should support line endings in paragraphs', async () => {
    const Content = await run('x\ny')

    expect(renderToStaticMarkup(<Content />)).toEqual(
      renderToStaticMarkup(<p>x{'\n'}y</p>)
    )
  })

  it('should support line endings between nodes paragraphs', async () => {
    const Content = await run('*x*\n[y]()')

    expect(renderToStaticMarkup(<Content />)).toEqual(
      renderToStaticMarkup(
        <p>
          <em>x</em>
          {'\n'}
          <a href="">y</a>
        </p>
      )
    )
  })

  it('should support imports', async () => {
    expect.assertions(2)

    const plugin = () => tree => {
      expect(tree.children[0]).toEqual({
        type: 'import',
        value: 'import X from "y"',
        position: {
          start: {line: 1, column: 1, offset: 0},
          end: {line: 1, column: 18, offset: 17},
          indent: []
        }
      })
    }

    const result = await mdx('import X from "y"', {rehypePlugins: [plugin]})

    expect(result).toMatch(/import X from "y"/)
  })

  it('should crash on incorrect imports', async () => {
    expect(() => {
      mdx.sync('import a')
    }).toThrow(/unknown: Unexpected token/)
  })

  it('should support import as a word when it’s not the top level', async () => {
    const Content = await run('> import a\n\n- import b')

    expect(renderToStaticMarkup(<Content />)).toEqual(
      renderToStaticMarkup(
        <>
          <blockquote>
            <p>import a</p>
          </blockquote>
          <ul>
            <li>import b</li>
          </ul>
        </>
      )
    )
  })

  it('should support exports', async () => {
    expect.assertions(2)

    const plugin = () => tree => {
      expect(tree.children[0]).toEqual({
        type: 'export',
        value: 'export const A = () => <b>!</b>',
        position: {
          start: {line: 1, column: 1, offset: 0},
          end: {line: 1, column: 32, offset: 31},
          indent: []
        }
      })
    }

    const result = await mdx('export const A = () => <b>!</b>', {
      rehypePlugins: [plugin]
    })

    expect(result).toMatch(/export const A = \(\) => <b>!<\/b>/)
  })

  it('should crash on incorrect exports', async () => {
    expect(() => {
      mdx.sync('export a')
    }).toThrow(/unknown: Unexpected token/)
  })

  it('should support export as a word when it’s not the top level', async () => {
    const Content = await run('> export a\n\n- export b')

    expect(renderToStaticMarkup(<Content />)).toEqual(
      renderToStaticMarkup(
        <>
          <blockquote>
            <p>export a</p>
          </blockquote>
          <ul>
            <li>export b</li>
          </ul>
        </>
      )
    )
  })

  it('should support JSX (flow, block)', async () => {
    const Content = await run('<main><span /></main>')

    expect(renderToStaticMarkup(<Content />)).toEqual(
      renderToStaticMarkup(
        <main>
          <span />
        </main>
      )
    )
  })

  it('should support JSX (text, inline)', async () => {
    const Content = await run('x <span /> y')

    expect(renderToStaticMarkup(<Content />)).toEqual(
      renderToStaticMarkup(
        <p>
          x <span /> y
        </p>
      )
    )
  })

  it('should support JSX expressions (flow, block)', async () => {
    const Content = await run('{1 + 1}')

    expect(renderToStaticMarkup(<Content />)).toEqual('2')
  })

  it('should support JSX expressions (text, inline)', async () => {
    const Content = await run('x {1 + 1} y')

    expect(renderToStaticMarkup(<Content />)).toEqual(
      renderToStaticMarkup(<p>x 2 y</p>)
    )
  })

  it('should support a default export for a layout', async () => {
    const Content = await run(
      'export default props => <main {...props} />\n\nx'
    )

    expect(renderToStaticMarkup(<Content />)).toEqual(
      renderToStaticMarkup(
        <main>
          <p>x</p>
        </main>
      )
    )
  })

  it('should support semicolons in the default export', async () => {
    const Content = await run(
      'export default props => <section {...props} />;;\n\nx'
    )

    expect(renderToStaticMarkup(<Content />)).toEqual(
      renderToStaticMarkup(
        <section>
          <p>x</p>
        </section>
      )
    )
  })

  it('should support a multiline default export', async () => {
    const Content = await run(
      'export default ({children}) => (\n  <article>\n    {children}\n  </article>\n)\n\nx'
    )

    expect(renderToStaticMarkup(<Content />)).toEqual(
      renderToStaticMarkup(
        <article>
          <p>x</p>
        </article>
      )
    )
  })

  it('should support using a non-default export in content', async () => {
    const Content = await run(
      'export var X = props => <b {...props} />\n\n<X />'
    )

    expect(renderToStaticMarkup(<Content />)).toEqual(
      renderToStaticMarkup(<b />)
    )
  })

  it('should support overwriting missing compile-time components at run-time', async () => {
    const Content = await run('x <Y /> z')

    expect(
      renderToStaticMarkup(
        <MDXProvider
          components={{
            Y: props => <span style={{color: 'tomato'}} {...props} />
          }}
        >
          <Content />
        </MDXProvider>
      )
    ).toEqual(
      renderToStaticMarkup(
        <p>
          x <span style={{color: 'tomato'}} /> z
        </p>
      )
    )
  })

  it('should not crash but issue a warning when an undefined component is used', async () => {
    const Content = await run('x <Y /> z')
    const warn = console.warn
    console.warn = jest.fn()

    // To do: a fragment would probably be better?
    // Maybe the components children?
    expect(renderToStaticMarkup(<Content />)).toEqual(
      renderToStaticMarkup(
        <p>
          x <div /> z
        </p>
      )
    )

    expect(console.warn).toHaveBeenCalledWith(
      'Component Y was not imported, exported, or provided by MDXProvider as global scope'
    )

    console.warn = warn
  })

  it('should support `.` in component names for members', async () => {
    const Content = await run(
      'export var x = {y: props => <b {...props} />}\n\n<x.y />'
    )

    expect(renderToStaticMarkup(<Content />)).toEqual(
      renderToStaticMarkup(<b />)
    )
  })

  it('should ignore unknown nodes in mdxhast', async () => {
    const plugin = () => tree => {
      // A leaf.
      tree.children.push({type: 'unknown', value: 'y'})

      // A parent.
      tree.children.push({
        type: 'unknown',
        children: [{type: 'text', value: 'z'}]
      })
    }

    const Content = await run('x', {rehypePlugins: [plugin]})

    expect(renderToStaticMarkup(<Content />)).toEqual(
      renderToStaticMarkup(<p>x</p>)
    )
  })

  it('should support `element` nodes w/o `children` in mdxhast', async () => {
    const plugin = () => tree => {
      tree.children.push({type: 'element', tagName: 'y', properties: {}})
    }

    const Content = await run('x', {rehypePlugins: [plugin]})

    expect(renderToStaticMarkup(<Content />)).toEqual(
      renderToStaticMarkup(
        <>
          <p>x</p>
          <y />
        </>
      )
    )
  })

  it('should support `element` nodes w/o `properties` in mdxhast', async () => {
    const plugin = () => tree => {
      tree.children.push({
        type: 'element',
        tagName: 'y',
        children: [{type: 'text', value: 'z'}]
      })
    }

    const Content = await run('x', {rehypePlugins: [plugin]})

    expect(renderToStaticMarkup(<Content />)).toEqual(
      renderToStaticMarkup(
        <>
          <p>x</p>
          <y>z</y>
        </>
      )
    )
  })

  it('should support `skipExport` to not export anything', async () => {
    const resultDefault = await mdx('x')
    const resultTrue = await mdx('x', {skipExport: true})
    const resultFalse = await mdx('x', {skipExport: false})

    expect(resultDefault).toEqual(resultFalse)
    expect(resultTrue).toMatch(/\nfunction MDXContent/)
    expect(resultFalse).toMatch(/export default function MDXContent/)
  })

  it('should support `wrapExport` to wrap the exported value', async () => {
    const resultDefault = await mdx('x')
    const resultValue = await mdx('x', {wrapExport: 'y'})
    const resultNull = await mdx('x', {wrapExport: null})

    expect(resultDefault).toEqual(resultNull)
    expect(resultValue).toMatch(/export default y\(MDXContent\)/)
    expect(resultNull).toMatch(/export default function MDXContent/)
  })

  it('should expose an `isMDXComponent` field on the component', async () => {
    const Content = await run('x')

    expect(Content.isMDXComponent).toEqual(true)
  })

  it('should escape what could look like template literal placeholders in text', async () => {
    /* eslint-disable no-template-curly-in-string */
    const Content = await run('`${x}`')

    expect(renderToStaticMarkup(<Content />)).toEqual(
      renderToStaticMarkup(
        <p>
          <code>{'${x}'}</code>
        </p>
      )
    )
    /* eslint-enable no-template-curly-in-string */
  })

  it('should support a dollar in text', async () => {
    const Content = await run('$')

    expect(renderToStaticMarkup(<Content />)).toEqual(
      renderToStaticMarkup(<p>$</p>)
    )
  })

  it('should support an escaped dollar in text', async () => {
    const Content = await run('\\$')

    // To do: should be `$` according to CM.
    // Old GFM and the version of remark used in MDX do not support this, but
    // CommonMark and latest remark do.
    expect(renderToStaticMarkup(<Content />)).toEqual(
      renderToStaticMarkup(<p>\$</p>)
    )
  })
})

describe('default', () => {
  it('should be async', async () => {
    expect(mdx('x')).resolves.toMatch(/<p>{`x`}<\/p>/)
  })

  it('should support `remarkPlugins`', async () => {
    expect(mdx('$x$', {remarkPlugins: [math]})).resolves.toMatch(
      /"className": "math math-inline",/
    )
  })
})

describe('sync', () => {
  it('should be sync', () => {
    expect(mdx.sync('x')).toMatch(/<p>{`x`}<\/p>/)
  })

  it('should support `remarkPlugins`', () => {
    expect(mdx.sync('$x$', {remarkPlugins: [math]})).toMatch(
      /"className": "math math-inline",/
    )
  })
})

describe('createMdxAstCompiler', () => {
  it('should create a unified processor', () => {
    const result = mdx.createMdxAstCompiler()
    const tree = result.runSync(result.parse('x'))

    expect(tree).toEqual({
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'p',
          properties: {},
          children: [
            {
              type: 'text',
              value: 'x',
              position: {
                start: {line: 1, column: 1, offset: 0},
                end: {line: 1, column: 2, offset: 1}
              }
            }
          ],
          position: {
            start: {line: 1, column: 1, offset: 0},
            end: {line: 1, column: 2, offset: 1}
          }
        }
      ],
      position: {
        start: {line: 1, column: 1, offset: 0},
        end: {line: 1, column: 2, offset: 1}
      }
    })
  })
})

describe('createCompiler', () => {
  it('should create a unified processor', () => {
    expect(String(mdx.createCompiler().processSync('x'))).toMatch(
      /<p>{`x`}<\/p>/
    )
  })
})

describe('mdx-ast-to-mdx-hast', () => {
  it('should be a unified plugin transforming the tree', () => {
    const mdxast = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{type: 'mdxSpanExpression', value: '1 + 1'}]
        }
      ]
    }

    const mdxhast = unified().use(toMdxHast).runSync(mdxast)

    expect(mdxhast).toEqual({
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'p',
          properties: {},
          children: [{type: 'mdxSpanExpression', value: '1 + 1'}]
        }
      ]
    })
  })
})

describe('mdx-hast-to-jsx', () => {
  it('should be a unified plugin defining a compiler', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'x',
          children: [{type: 'mdxSpanExpression', value: '1 + 1'}]
        }
      ]
    }

    const doc = unified().use(toJsx).stringify(tree)

    expect(doc).toMatch(/export default function MDXContent/)
    expect(doc).toMatch(/<x>\{1 \+ 1}<\/x>/)
  })
})

describe('mdx-hast-to-jsx.toJSX', () => {
  it('should be a function that serializes mdxhast nodes', () => {
    expect(toJsx.toJSX({type: 'element', tagName: 'x'})).toEqual('<x/>')
    expect(toJsx.toJSX({type: 'mdxSpanExpression', value: '1 + 1'})).toEqual(
      '{1 + 1}'
    )
  })
})
