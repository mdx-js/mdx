import {test} from 'uvu'
import * as assert from 'uvu/assert'
import {removePosition} from 'unist-util-remove-position'
import React from 'react'
import * as runtime from 'react/jsx-runtime.js'
// Note: this is needed because the root react is an experimental version,
// for the website, but the React here and in `@mdx-js/react` is a stable one.
import {renderToStaticMarkup} from '../../react/node_modules/react-dom/server.js'
import {MDXProvider, useMDXComponents} from '../../react/index.js'
import footnotes from 'remark-footnotes'
import gfm from 'remark-gfm'
import math from 'remark-math'
import katex from 'rehype-katex'
import {compile, compileSync, evaluate, createProcessor} from '../index.js'

test('should generate JSX', async () => {
  const result = await compile('Hello World', {jsx: true})

  assert.match(result, /<_components.p>\{"Hello World"\}<\/_components.p>/)
})

test('should compile JSX to function calls', async () => {
  const result = await compile('Hello World')

  assert.match(
    result,
    /_jsx\(_components\.p, {\s+children: "Hello World"\s+}\)/
  )
})

test('should generate runnable JS', async () => {
  const {default: Content} = await evaluate('Hello World', runtime)

  assert.equal(
    renderToStaticMarkup(<Content />),
    renderToStaticMarkup(<p>Hello World</p>)
  )
})

test('should support `&`, `<`, and `>` in text', async () => {
  // Note: we don’t allow `<` in MDX files, but the character reference will
  // get decoded and is present in the AST as `<`.
  const {default: Content} = await evaluate('a &lt; b > c & d', runtime)

  assert.equal(
    renderToStaticMarkup(<Content />),
    renderToStaticMarkup(<p>{'a < b > c & d'}</p>)
  )
})

test('should generate JSX-compliant strings', async () => {
  const {default: Content} = await evaluate(
    '!["so" cute](cats.com/cat.jpeg)',
    runtime
  )

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
  const {default: Content} = await evaluate('$x$', {
    remarkPlugins: [math],
    ...runtime
  })

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
  const {default: Content} = await evaluate('x [^y]\n\n[^y]: z', {
    remarkPlugins: [footnotes],
    ...runtime
  })

  assert.equal(
    renderToStaticMarkup(<Content />),
    renderToStaticMarkup(
      <>
        <p>
          x{' '}
          <a
            href="#fn1"
            className="footnote-ref"
            id="fnref1"
            role="doc-noteref"
          >
            <sup>1</sup>
          </a>
        </p>
        {'\n'}
        <section className="footnotes" role="doc-endnotes">
          {'\n'}
          <hr />
          {'\n'}
          <ol>
            {'\n'}
            <li id="fn1" role="doc-endnote">
              z
              <a href="#fnref1" className="footnote-back" role="doc-backlink">
                ↩
              </a>
            </li>
            {'\n'}
          </ol>
          {'\n'}
        </section>
      </>
    )
  )
})

test('should support `rehypePlugins`', async () => {
  const {default: Content} = await evaluate('$x$', {
    remarkPlugins: [math],
    rehypePlugins: [katex],
    ...runtime
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

  const {default: Content} = await evaluate('x', {
    remarkPlugins: [plugin],
    ...runtime
  })

  assert.equal(
    renderToStaticMarkup(<Content />),
    renderToStaticMarkup(<p>y</p>)
  )
})

test('should support a `VFileCompatible` to set the vfile’s path', async () => {
  const plugin = () => (_, file) => {
    assert.equal(file.path, 'y')
  }

  await evaluate({value: 'x', path: 'y'}, {remarkPlugins: [plugin], ...runtime})
})

test('should use an `inlineCode` “element” in mdxhast', async () => {
  const {default: Content} = await evaluate('`x`', runtime)

  assert.equal(
    renderToStaticMarkup(<Content />),
    renderToStaticMarkup(
      <p>
        <code>x</code>
      </p>
    )
  )
})

test('should support `pre`/`code` from empty fenced code', async () => {
  const {default: Content} = await evaluate('```\n```', runtime)

  assert.equal(
    renderToStaticMarkup(<Content />),
    renderToStaticMarkup(
      <pre>
        <code></code>
      </pre>
    )
  )
})

test('should support `pre`/`code` from fenced code', async () => {
  const {default: Content} = await evaluate('```\nx\n```', runtime)

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
  const {default: Content} = await evaluate('```js\nx\n```', runtime)

  assert.equal(
    renderToStaticMarkup(<Content />),
    renderToStaticMarkup(
      <pre>
        <code className="language-js">x{'\n'}</code>
      </pre>
    )
  )
})

test('should support a block quote in markdown', async () => {
  const {default: Content} = await evaluate('> x\n> `y`', runtime)

  assert.equal(
    renderToStaticMarkup(<Content />),
    renderToStaticMarkup(
      <blockquote>
        {'\n'}
        <p>
          x{'\n'}
          <code>y</code>
        </p>
        {'\n'}
      </blockquote>
    )
  )
})

test('should support html/jsx inside code in markdown', async () => {
  const {default: Content} = await evaluate('`<x>`', runtime)

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
  const {default: Content} = await evaluate(
    '| A | B |\n| :- | -: |\n| a | b |',
    {remarkPlugins: [gfm], ...runtime}
  )

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
  const {default: Content} = await evaluate('x\ny', runtime)

  assert.equal(
    renderToStaticMarkup(<Content />),
    renderToStaticMarkup(<p>x{'\n'}y</p>)
  )
})

test('should support line endings between nodes paragraphs', async () => {
  const {default: Content} = await evaluate('*x*\n[y]()', runtime)

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
  const {default: Content} = await evaluate('', runtime)

  assert.equal(renderToStaticMarkup(<Content />), renderToStaticMarkup(<></>))
})

test('should support an ignored node instead of a `root`', async () => {
  const plugin = () => () => ({type: 'doctype', name: 'html'})
  const {default: Content} = await evaluate('', {
    rehypePlugins: [plugin],
    ...runtime
  })

  assert.equal(renderToStaticMarkup(<Content />), renderToStaticMarkup(<></>))
})

test('should support an element instead of a `root`', async () => {
  const plugin = () => () => ({type: 'element', tagName: 'x', children: []})
  const {default: Content} = await evaluate('', {
    rehypePlugins: [plugin],
    ...runtime
  })

  assert.equal(renderToStaticMarkup(<Content />), renderToStaticMarkup(<x />))
})

test('should support imports', async () => {
  let called = false

  const plugin = () => tree => {
    // Ignore the subtree at `data.estree`.
    assert.equal(
      {...tree.children[0], data: undefined},
      {
        type: 'mdxjsEsm',
        value: 'import X from "y"',
        data: undefined,
        position: {
          start: {line: 1, column: 1, offset: 0},
          end: {line: 1, column: 18, offset: 17}
        }
      }
    )

    called = true
  }

  const result = await compile('import X from "y"', {rehypePlugins: [plugin]})

  assert.match(result, /import X from "y"/)
  assert.ok(called)
})

test('should crash on incorrect imports', async () => {
  try {
    await compile('import a')
    assert.unreachable('should not compile')
  } catch (error) {
    assert.match(
      String(error),
      /Could not parse import\/exports with acorn: SyntaxError: Unexpected token/
    )
  }
})

test('should support import as a word when it’s not the top level', async () => {
  const {default: Content} = await evaluate('> import a\n\n- import b', runtime)

  assert.equal(
    renderToStaticMarkup(<Content />),
    renderToStaticMarkup(
      <>
        <blockquote>
          {'\n'}
          <p>import a</p>
          {'\n'}
        </blockquote>
        {'\n'}
        <ul>
          {'\n'}
          <li>import b</li>
          {'\n'}
        </ul>
      </>
    )
  )
})

test('should support exports', async () => {
  let called = false

  const plugin = () => tree => {
    // Ignore the subtree at `data.estree`.
    assert.equal(
      {...tree.children[0], data: undefined},
      {
        type: 'mdxjsEsm',
        value: 'export const A = () => <b>!</b>',
        data: undefined,
        position: {
          start: {line: 1, column: 1, offset: 0},
          end: {line: 1, column: 32, offset: 31}
        }
      }
    )
    called = true
  }

  const result = await compile('export const A = () => <b>!</b>', {
    rehypePlugins: [plugin],
    jsx: true
  })

  assert.match(result, /export const A = \(\) => <b>!<\/b>/)
  assert.ok(called)
})

test('should crash on incorrect exports', async () => {
  try {
    await compile('export a')
    assert.unreachable('should not compile')
  } catch (error) {
    assert.match(
      String(error),
      /Could not parse import\/exports with acorn: SyntaxError: Unexpected token/
    )
  }
})

test('should support export as a word when it’s not the top level', async () => {
  const {default: Content} = await evaluate('> export a\n\n- export b', runtime)

  assert.equal(
    renderToStaticMarkup(<Content />),
    renderToStaticMarkup(
      <>
        <blockquote>
          {'\n'}
          <p>export a</p>
          {'\n'}
        </blockquote>
        {'\n'}
        <ul>
          {'\n'}
          <li>export b</li>
          {'\n'}
        </ul>
      </>
    )
  )
})

test('should support JSX (flow, block)', async () => {
  const {default: Content} = await evaluate('<main><span /></main>', runtime)

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
  const {default: Content} = await evaluate('x <span /> y', runtime)

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
  const {default: Content} = await evaluate('{1 + 1}', runtime)

  assert.equal(renderToStaticMarkup(<Content />), '2')
})

test('should support JSX expressions (text, inline)', async () => {
  const {default: Content} = await evaluate('x {1 + 1} y', runtime)

  assert.equal(
    renderToStaticMarkup(<Content />),
    renderToStaticMarkup(<p>x 2 y</p>)
  )
})

test('should support a default export for a layout', async () => {
  const {default: Content} = await evaluate(
    'export default props => <main {...props} />\n\nx',
    runtime
  )

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
  let result = await compile('import a from "b"\nexport default a')
  assert.match(result, /import a from "b"/)
  assert.match(result, /const MDXLayout = a/)

  result = await compile('export {default} from "a"')
  assert.match(result, /import MDXLayout from "a"/)

  // These are not export defaults: they imports default but export as
  // something else.
  result = await compile('export {default as a} from "b"')
  assert.match(result, /export {default as a} from "b"/)
  assert.match(result, /{wrapper: MDXLayout}/)
  result = await compile('export {default as a, b} from "c"')
  assert.match(result, /export {default as a, b} from "c"/)
  assert.match(result, /{wrapper: MDXLayout}/)

  // These are export defaults.
  result = await compile('export {a as default} from "b"')
  assert.match(result, /import {a as MDXLayout} from "b"/)
  assert.not.match(result, /const MDXLayout/)
  result = await compile('export {a as default, b} from "c"')
  assert.match(result, /export {b} from "c"/)
  assert.match(result, /import {a as MDXLayout} from "c"/)
  assert.not.match(result, /const MDXLayout/)
})

test('should support semicolons in the default export', async () => {
  const {default: Content} = await evaluate(
    'export default props => <section {...props} />;\n\nx',
    runtime
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
  const {default: Content} = await evaluate(
    'export default ({children}) => (\n  <article>\n    {children}\n  </article>\n)\n\nx',
    runtime
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
  const {default: Content} = await evaluate(
    'export var X = props => <b {...props} />\n\n<X />',
    runtime
  )

  assert.equal(renderToStaticMarkup(<Content />), renderToStaticMarkup(<b />))
})

test('should support overwriting missing compile-time components at run-time', async () => {
  const {default: Content} = await evaluate('x <Y /> z', {
    ...runtime,
    useMDXComponents
  })

  assert.equal(
    renderToStaticMarkup(
      <MDXProvider
        components={{
          Y(props) {
            return <span style={{color: 'tomato'}} {...props} />
          }
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

test('should throw when an undefined component is used', async () => {
  const {default: Content} = await evaluate('w <X>y</X> z', runtime)
  const calls = []
  const {error} = console

  console.error = (...parameters) => {
    calls.push(parameters)
  }

  try {
    renderToStaticMarkup(<Content />)
    assert.unreachable('should not compile')
  } catch (error) {
    assert.match(String(error), /Error: Element type is invalid/)
  }

  console.error = error

  assert.equal(calls.length, 1)
  assert.match(calls[0][0], /Warning: React.jsx: type is invalid/)
})

test('should support `.` in component names for members', async () => {
  const {default: Content} = await evaluate(
    'export var x = {y: props => <b {...props} />}\n\n<x.y />',
    runtime
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

  try {
    await compile('x', {rehypePlugins: [plugin]})
    assert.unreachable('should not compile')
  } catch (error) {
    assert.match(String(error), /Cannot handle unknown node `unknown`/)
  }
})

test('should support `element` nodes w/o `properties` in mdxhast', async () => {
  const plugin = () => tree => {
    tree.children.push({
      type: 'element',
      tagName: 'y',
      children: [{type: 'text', value: 'z'}]
    })
  }

  const {default: Content} = await evaluate('x', {
    rehypePlugins: [plugin],
    ...runtime
  })

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

test('should escape what could look like template literal placeholders in text', async () => {
  /* eslint-disable no-template-curly-in-string */
  const {default: Content} = await evaluate('`${x}`', runtime)

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
  const {default: Content} = await evaluate('$', runtime)

  assert.equal(
    renderToStaticMarkup(<Content />),
    renderToStaticMarkup(<p>$</p>)
  )
})

test('should support an escaped dollar in text', async () => {
  const {default: Content} = await evaluate('\\$', runtime)

  assert.equal(
    renderToStaticMarkup(<Content />),
    renderToStaticMarkup(<p>$</p>)
  )
})

test('should support an empty expression in JSX', async () => {
  const {default: Content} = await evaluate('<x>{}</x>', runtime)

  assert.equal(renderToStaticMarkup(<Content />), renderToStaticMarkup(<x />))
})

test('should support a more complex expression in JSX', async () => {
  const {default: Content} = await evaluate(
    '<x>{(() => 1 + 2)(1)}</x>',
    runtime
  )

  assert.equal(
    renderToStaticMarkup(<Content />),
    renderToStaticMarkup(<x>3</x>)
  )
})

test('default: should be async', async () => {
  assert.match(
    await compile('x', {jsx: true}),
    /<_components\.p>{"x"}<\/_components\.p>/
  )
})

test('default: should support `remarkPlugins`', async () => {
  assert.match(
    await compile('$x$', {jsx: true, remarkPlugins: [math]}),
    /className="math math-inline"/
  )
})

test('sync: should be sync', () => {
  assert.match(
    compileSync('x', {jsx: true}),
    /<_components\.p>{"x"}<\/_components\.p>/
  )
})

test('sync: should support `remarkPlugins`', () => {
  assert.match(
    compileSync('$x$', {remarkPlugins: [math], jsx: true}),
    /className="math math-inline"/
  )
})

test('should create a unified processor', async () => {
  const remarkPlugin = () => tree => {
    const clone = removePosition(JSON.parse(JSON.stringify(tree)), true)

    assert.equal(clone, {
      type: 'root',
      children: [{type: 'paragraph', children: [{type: 'text', value: 'x'}]}]
    })
  }

  const rehypePlugin = () => tree => {
    const clone = removePosition(JSON.parse(JSON.stringify(tree)), true)

    assert.equal(clone, {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'p',
          properties: {},
          children: [{type: 'text', value: 'x'}]
        }
      ]
    })
  }

  const processor = createProcessor({
    remarkPlugins: [remarkPlugin],
    rehypePlugins: [rehypePlugin],
    jsx: true
  })

  assert.match(
    await processor.process('x'),
    /<_components\.p>{"x"}<\/_components\.p>/
  )
})

test.run()
