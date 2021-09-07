const {test} = require('uvu')
const assert = require('uvu/assert')
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
const gfm = require('remark-gfm')
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

test('should generate JSX', async () => {
  const result = await mdx('Hello World')

  assert.match(result, /<p>\{"Hello World"\}<\/p>/)
})

test('should generate runnable JSX', async () => {
  const Content = await run('Hello World')

  assert.equal(
    renderToStaticMarkup(<Content />),
    renderToStaticMarkup(<p>Hello World</p>)
  )
})

test('should support `&`, `<`, and `>` in text', async () => {
  // Note: we don’t allow `<` in MDX files, but the character reference will
  // get decoded and is present in the AST as `<`.
  const Content = await run('a &lt; b > c & d')

  assert.equal(
    renderToStaticMarkup(<Content />),
    renderToStaticMarkup(<p>{'a < b > c & d'}</p>)
  )
})

test('should generate JSX-compliant strings', async () => {
  const Content = await run('!["so" cute](cats.com/cat.jpeg)')

  // Note: Escaped quotes (\") isn't valid for JSX string syntax. So we're
  // making sure that quotes aren't escaped here (prettier doesn't like us
  // using the character reference (&quot;) in the expect below)
  assert.equal(
    renderToStaticMarkup(<Content />),
    renderToStaticMarkup(
      <p>
        {/* prettier-ignore */}
        <img src="cats.com/cat.jpeg" alt="&quot;so&quot; cute" />
      </p>
    )
  )
})

test('should support `remarkPlugins` (math)', async () => {
  const Content = await run('$x$', {remarkPlugins: [math]})

  assert.equal(
    renderToStaticMarkup(<Content />),
    renderToStaticMarkup(
      <p>
        <span className="math math-inline">x</span>
      </p>
    )
  )
})

test('should support `remarkPlugins` (footnotes)', async () => {
  const Content = await run('x [^y]\n\n[^y]: z', {remarkPlugins: [footnotes]})

  assert.equal(
    renderToStaticMarkup(<Content />),
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

test('should support `rehypePlugins`', async () => {
  const Content = await run('$x$', {
    remarkPlugins: [math],
    rehypePlugins: [katex]
  })

  assert.equal(
    renderToStaticMarkup(<Content />),
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

test('should support async plugins', async () => {
  const plugin = () => async tree => {
    tree.children[0].children[0].value = 'y'
  }

  const Content = await run('x', {remarkPlugins: [plugin]})

  assert.equal(
    renderToStaticMarkup(<Content />),
    renderToStaticMarkup(<p>y</p>)
  )
})

test('should support `filepath` to set the vfile’s path', async () => {
  const plugin = () => (_, file) => {
    assert.equal(file.path, 'y')
  }

  await run('x', {filepath: 'y', remarkPlugins: [plugin]})
})

test('should use an `inlineCode` “element” in mdxhast', async () => {
  let called = false

  const plugin = () => tree => {
    assert.equal(tree.children[0].children[0], {
      type: 'element',
      tagName: 'inlineCode',
      properties: {},
      children: [{type: 'text', value: 'x'}],
      position: {
        start: {line: 1, column: 1, offset: 0},
        end: {line: 1, column: 4, offset: 3}
      }
    })
    called = true
  }

  await run('`x`', {rehypePlugins: [plugin]})

  assert.ok(called)
})

test('should support `pre`/`code` from empty fenced code in mdxhast', async () => {
  const Content = await run('```\n```')

  assert.equal(
    renderToStaticMarkup(<Content />),
    renderToStaticMarkup(
      <pre>
        <code></code>
      </pre>
    )
  )
})

test('should support `pre`/`code` from fenced code in mdxhast', async () => {
  const Content = await run('```\nx\n```')

  assert.equal(
    renderToStaticMarkup(<Content />),
    renderToStaticMarkup(
      <pre>
        <code>x{'\n'}</code>
      </pre>
    )
  )
})

test('should support `pre`/`code` from fenced code w/ lang in mdxhast', async () => {
  const Content = await run('```js\nx\n```')

  assert.equal(
    renderToStaticMarkup(<Content />),
    renderToStaticMarkup(
      <pre>
        <code className="language-js">x{'\n'}</code>
      </pre>
    )
  )
})

test('should support attributes from fenced code meta string in mdxhast', async () => {
  const Content = await run('```js id class=y title=z\nx\n```')
  const error = console.error
  console.error = () => {}

  assert.equal(
    renderToStaticMarkup(<Content />),
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

test('should support a block quote in markdown', async () => {
  const Content = await run('> x\n> `y`')

  assert.equal(
    renderToStaticMarkup(<Content />),
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

test('should support html/jsx inside code in markdown', async () => {
  const Content = await run('`<x>`')

  assert.equal(
    renderToStaticMarkup(<Content />),
    renderToStaticMarkup(
      <p>
        <code>{'<x>'}</code>
      </p>
    )
  )
})

test('should support tables in markdown', async () => {
  const Content = await run('| A | B |\n| :- | -: |\n| a | b |', {
    remarkPlugins: [gfm]
  })

  assert.equal(
    renderToStaticMarkup(<Content />),
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

test('should support line endings in paragraphs', async () => {
  const Content = await run('x\ny')

  assert.equal(
    renderToStaticMarkup(<Content />),
    renderToStaticMarkup(<p>x{'\n'}y</p>)
  )
})

test('should support line endings between nodes paragraphs', async () => {
  const Content = await run('*x*\n[y]()')

  assert.equal(
    renderToStaticMarkup(<Content />),
    renderToStaticMarkup(
      <p>
        <em>x</em>
        {'\n'}
        <a href="">y</a>
      </p>
    )
  )
})

test('should support an empty document', async () => {
  const Content = await run('')

  assert.equal(renderToStaticMarkup(<Content />), renderToStaticMarkup(<></>))
})

test('should support an ignored node instead of a `root`', async () => {
  const plugin = () => () => ({type: 'doctype', name: 'html'})
  const Content = await run('', {rehypePlugins: [plugin]})

  assert.equal(renderToStaticMarkup(<Content />), renderToStaticMarkup(<></>))
})

test('should support an element instead of a `root`', async () => {
  const plugin = () => () => ({type: 'element', tagName: 'x', children: []})
  const Content = await run('', {rehypePlugins: [plugin]})

  assert.equal(renderToStaticMarkup(<Content />), renderToStaticMarkup(<x />))
})

test('should support imports', async () => {
  let called = false

  const plugin = () => tree => {
    // Ignore the subtree at `data.estree`.
    assert.equal(Object.assign({}, tree.children[0], {data: undefined}), {
      type: 'mdxjsEsm',
      value: 'import X from "y"',
      data: undefined,
      position: {
        start: {line: 1, column: 1, offset: 0},
        end: {line: 1, column: 18, offset: 17}
      }
    })

    called = true
  }

  const result = await mdx('import X from "y"', {rehypePlugins: [plugin]})

  assert.match(result, /import X from "y"/)
  assert.ok(called)
})

test('should crash on incorrect imports', async () => {
  assert.throws(() => {
    mdx.sync('import a')
  }, /Could not parse import\/exports with acorn: SyntaxError: Unexpected token/)
})

test('should support import as a word when it’s not the top level', async () => {
  const Content = await run('> import a\n\n- import b')

  assert.equal(
    renderToStaticMarkup(<Content />),
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

test('should support exports', async () => {
  let called = false

  const plugin = () => tree => {
    // Ignore the subtree at `data.estree`.
    assert.equal(Object.assign({}, tree.children[0], {data: undefined}), {
      type: 'mdxjsEsm',
      value: 'export const A = () => <b>!</b>',
      data: undefined,
      position: {
        start: {line: 1, column: 1, offset: 0},
        end: {line: 1, column: 32, offset: 31}
      }
    })
    called = true
  }

  const result = await mdx('export const A = () => <b>!</b>', {
    rehypePlugins: [plugin]
  })

  assert.match(result, /export const A = \(\) => <b>!<\/b>/)
  assert.ok(called)
})

test('should crash on incorrect exports', async () => {
  assert.throws(() => {
    mdx.sync('export a')
  }, /Could not parse import\/exports with acorn: SyntaxError: Unexpected token/)
})

test('should support export as a word when it’s not the top level', async () => {
  const Content = await run('> export a\n\n- export b')

  assert.equal(
    renderToStaticMarkup(<Content />),
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

test('should support JSX (flow, block)', async () => {
  const Content = await run('<main><span /></main>')

  assert.equal(
    renderToStaticMarkup(<Content />),
    renderToStaticMarkup(
      <main>
        <span />
      </main>
    )
  )
})

test('should support JSX (text, inline)', async () => {
  const Content = await run('x <span /> y')

  assert.equal(
    renderToStaticMarkup(<Content />),
    renderToStaticMarkup(
      <p>
        x <span /> y
      </p>
    )
  )
})

test('should support JSX expressions (flow, block)', async () => {
  const Content = await run('{1 + 1}')

  assert.equal(renderToStaticMarkup(<Content />), '2')
})

test('should support JSX expressions (text, inline)', async () => {
  const Content = await run('x {1 + 1} y')

  assert.equal(
    renderToStaticMarkup(<Content />),
    renderToStaticMarkup(<p>x 2 y</p>)
  )
})

test('should support a default export for a layout', async () => {
  const Content = await run('export default props => <main {...props} />\n\nx')

  assert.equal(
    renderToStaticMarkup(<Content />),
    renderToStaticMarkup(
      <main>
        <p>x</p>
      </main>
    )
  )
})

test('should support a default export from an import', async () => {
  let result = await mdx('import a from "b"\nexport default a')
  assert.match(result, /import a from "b"/)
  assert.match(result, /const MDXLayout = a/)

  result = await mdx('export {default} from "a"')
  assert.match(result, /import MDXLayout from "a"/)

  // These are not export defaults: they imports default but export as
  // something else.
  result = await mdx('export {default as a} from "b"')
  assert.match(result, /export {default as a} from "b"/)
  assert.match(result, /const MDXLayout = "wrapper"/)
  result = await mdx('export {default as a, b} from "c"')
  assert.match(result, /export {default as a, b} from "c"/)
  assert.match(result, /const MDXLayout = "wrapper"/)

  // These are export defaults.
  result = await mdx('export {a as default} from "b"')
  assert.match(result, /import {a as MDXLayout} from "b"/)
  assert.not.match(result, /const MDXLayout/)
  result = await mdx('export {a as default, b} from "c"')
  assert.match(result, /export {b} from "c"/)
  assert.match(result, /import {a as MDXLayout} from "c"/)
  assert.not.match(result, /const MDXLayout/)
})

test('should support semicolons in the default export', async () => {
  const Content = await run(
    'export default props => <section {...props} />;\n\nx'
  )

  assert.equal(
    renderToStaticMarkup(<Content />),
    renderToStaticMarkup(
      <section>
        <p>x</p>
      </section>
    )
  )
})

test('should support a multiline default export', async () => {
  const Content = await run(
    'export default ({children}) => (\n  <article>\n    {children}\n  </article>\n)\n\nx'
  )

  assert.equal(
    renderToStaticMarkup(<Content />),
    renderToStaticMarkup(
      <article>
        <p>x</p>
      </article>
    )
  )
})

test('should support using a non-default export in content', async () => {
  const Content = await run('export var X = props => <b {...props} />\n\n<X />')

  assert.equal(renderToStaticMarkup(<Content />), renderToStaticMarkup(<b />))
})

test('should support overwriting missing compile-time components at run-time', async () => {
  const Content = await run('x <Y /> z')

  assert.equal(
    renderToStaticMarkup(
      <MDXProvider
        components={{
          Y: props => <span style={{color: 'tomato'}} {...props} />
        }}
      >
        {<Content />}
      </MDXProvider>
    ),
    renderToStaticMarkup(
      <p>
        x <span style={{color: 'tomato'}} /> z
      </p>
    )
  )
})

test('should not crash but issue a warning when an undefined component is used', async () => {
  const Content = await run('w <X>y</X> z')
  let calls = []
  const warn = console.warn
  console.warn = (...parameters) => {
    calls.push(parameters)
  }

  assert.equal(
    renderToStaticMarkup(<Content />),
    renderToStaticMarkup(<p>w y z</p>)
  )

  assert.equal(calls, [
    [
      'Component `%s` was not imported, exported, or provided by MDXProvider as global scope',
      'X'
    ]
  ])

  console.warn = warn
})

test('should support `.` in component names for members', async () => {
  const Content = await run(
    'export var x = {y: props => <b {...props} />}\n\n<x.y />'
  )

  assert.equal(renderToStaticMarkup(<Content />), renderToStaticMarkup(<b />))
})

test('should crash on unknown nodes in mdxhast', async () => {
  const plugin = () => tree => {
    // A leaf.
    tree.children.push({type: 'unknown', value: 'y'})

    // A parent.
    tree.children.push({
      type: 'unknown',
      children: [{type: 'text', value: 'z'}]
    })
  }

  assert.throws(() => {
    mdx.sync('x', {rehypePlugins: [plugin]})
  }, /Cannot handle unknown node `unknown`/)
})

test('should support `element` nodes w/o `properties` in mdxhast', async () => {
  const plugin = () => tree => {
    tree.children.push({
      type: 'element',
      tagName: 'y',
      children: [{type: 'text', value: 'z'}]
    })
  }

  const Content = await run('x', {rehypePlugins: [plugin]})

  assert.equal(
    renderToStaticMarkup(<Content />),
    renderToStaticMarkup(
      <>
        <p>x</p>
        <y>z</y>
      </>
    )
  )
})

test('should support `skipExport` to not export anything', async () => {
  const resultDefault = await mdx('x')
  const resultTrue = await mdx('x', {skipExport: true})
  const resultFalse = await mdx('x', {skipExport: false})

  assert.equal(resultDefault, resultFalse)
  assert.match(resultTrue, /\nfunction MDXContent/)
  assert.match(resultFalse, /export default MDXContent/)
})

test('should support `wrapExport` to wrap the exported value', async () => {
  const resultDefault = await mdx('x')
  const resultValue = await mdx('x', {wrapExport: 'y'})
  const resultNull = await mdx('x', {wrapExport: null})

  assert.equal(resultDefault, resultNull)
  assert.match(resultValue, /export default y\(MDXContent\)/)
  assert.match(resultNull, /export default MDXContent/)
})

test('should expose an `isMDXComponent` field on the component', async () => {
  const Content = await run('x')

  assert.equal(Content.isMDXComponent, true)
})

test('should escape what could look like template literal placeholders in text', async () => {
  /* eslint-disable no-template-curly-in-string */
  const Content = await run('`${x}`')

  assert.equal(
    renderToStaticMarkup(<Content />),
    renderToStaticMarkup(
      <p>
        <code>{'${x}'}</code>
      </p>
    )
  )
  /* eslint-enable no-template-curly-in-string */
})

test('should support a dollar in text', async () => {
  const Content = await run('$')

  assert.equal(
    renderToStaticMarkup(<Content />),
    renderToStaticMarkup(<p>$</p>)
  )
})

test('should support an escaped dollar in text', async () => {
  const Content = await run('\\$')

  assert.equal(
    renderToStaticMarkup(<Content />),
    renderToStaticMarkup(<p>$</p>)
  )
})

test('should support an empty expression in JSX', async () => {
  const Content = await run('<x>{}</x>')

  assert.equal(
    renderToStaticMarkup(<Content />),
    renderToStaticMarkup(
      <p>
        <x />
      </p>
    )
  )
})

test('should support a more complex expression in JSX', async () => {
  const Content = await run('<x>{(() => 1 + 2)(1)}</x>')

  assert.equal(
    renderToStaticMarkup(<Content />),
    renderToStaticMarkup(
      <p>
        <x>3</x>
      </p>
    )
  )
})

test('default: should be async', async () => {
  assert.match(await mdx('x'), /<p>{"x"}<\/p>/)
})

test('default: should support `remarkPlugins`', async () => {
  assert.match(
    await mdx('$x$', {remarkPlugins: [math]}),
    /className="math math-inline"/
  )
})

test('sync: should be sync', () => {
  assert.match(mdx.sync('x'), /<p>{"x"}<\/p>/)
})

test('sync: should support `remarkPlugins`', () => {
  assert.match(
    mdx.sync('$x$', {remarkPlugins: [math]}),
    /className="math math-inline"/
  )
})

test('createMdxAstCompiler: should create a unified processor', () => {
  const result = mdx.createMdxAstCompiler()
  const tree = result.runSync(result.parse('x'))

  assert.equal(tree, {
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

test('createCompiler: should create a unified processor', () => {
  assert.match(String(mdx.createCompiler().processSync('x')), /<p>{"x"}<\/p>/)
})

test('mdx-ast-to-mdx-hast: should be a unified plugin transforming the tree', () => {
  const mdxast = {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [{type: 'mdxTextExpression', value: '1 + 1'}]
      }
    ]
  }

  const mdxhast = unified().use(toMdxHast).runSync(mdxast)

  assert.equal(mdxhast, {
    type: 'root',
    children: [
      {
        type: 'element',
        tagName: 'p',
        properties: {},
        children: [{type: 'mdxTextExpression', value: '1 + 1'}]
      }
    ]
  })
})

test('mdx-hast-to-jsx: should be a unified plugin defining a compiler', () => {
  const tree = {
    type: 'root',
    children: [
      {type: 'element', tagName: 'x', children: [{type: 'text', value: 'a'}]}
    ]
  }

  const doc = unified().use(toJsx).stringify(tree)

  assert.match(doc, /export default MDXContent/)
  assert.match(doc, /<x>\{"a"}<\/x>/)
})

test.run()
