// Register directive nodes in mdast:
/// <reference types="mdast-util-directive" />

/**
 * @typedef {import('mdast').Root} MdastRoot
 */

import assert from 'node:assert/strict'
import {test} from 'node:test'
import {compile} from '@mdx-js/mdx'
import {h} from 'hastscript'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import rehypeKatex from 'rehype-katex'
import remarkDirective from 'remark-directive'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import {visit} from 'unist-util-visit'
import {run, runWhole} from './context/run.js'

test('@mdx-js/mdx: syntax: markdown (CommonMark)', async function (t) {
  await t.test(
    'should support links (resource) (`[]()` -> `a`)',
    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(await run(await compile('[a](b)')))
        ),
        '<p><a href="b">a</a></p>'
      )
    }
  )

  await t.test(
    'should support links (reference) (`[][]` -> `a`)',
    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(await run(await compile('[a]: b\n[a]')))
        ),
        '<p><a href="b">a</a></p>'
      )
    }
  )

  await t.test(
    'should *not* support links (autolink) (`<http://a>` -> error)',
    async function () {
      try {
        await compile('<http://a>')
        assert.fail()
      } catch (error) {
        assert.match(
          String(error),
          /note: to create a link in MDX, use `\[text]\(url\)/
        )
      }
    }
  )

  await t.test(
    'should support block quotes (`>` -> `blockquote`)',
    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(await run(await compile('> a')))
        ),
        '<blockquote>\n<p>a</p>\n</blockquote>'
      )
    }
  )

  await t.test(
    'should support characters (escape) (`\\` -> ``)',
    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(await run(await compile('\\*a*')))
        ),
        '<p>*a*</p>'
      )
    }
  )

  await t.test(
    'should support character (reference) (`&lt;` -> `<`)',
    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(await run(await compile('&lt;')))
        ),
        '<p>&lt;</p>'
      )
    }
  )

  await t.test(
    'should support code (fenced) (` ``` ` -> `pre code`)',
    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(await run(await compile('```\na')))
        ),
        '<pre><code>a\n</code></pre>'
      )
    }
  )

  await t.test(
    'should *not* support code (indented) (`\\ta` -> `p`)',
    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(await run(await compile('    a')))
        ),
        '<p>a</p>'
      )
    }
  )

  await t.test(
    'should support code (text) (`` `a` `` -> `code`)',
    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(await run(await compile('`a`')))
        ),
        '<p><code>a</code></p>'
      )
    }
  )

  await t.test('should support emphasis (`*` -> `em`)', async function () {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(await run(await compile('*a*')))
      ),
      '<p><em>a</em></p>'
    )
  })

  await t.test(
    'should support hard break (escape) (`\\\\\\n` -> `<br>`)',
    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(await run(await compile('a\\\nb')))
        ),
        '<p>a<br/>\nb</p>'
      )
    }
  )

  await t.test(
    'should support hard break (whitespace) (`\\\\\\n` -> `<br>`)',
    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(await run(await compile('a  \nb')))
        ),
        '<p>a<br/>\nb</p>'
      )
    }
  )

  await t.test(
    'should support headings (atx) (`#` -> `<h1>`)',
    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(await run(await compile('#')))
        ),
        '<h1></h1>'
      )
    }
  )

  await t.test(
    'should support headings (setext) (`=` -> `<h1>`)',
    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(await run(await compile('a\n=')))
        ),
        '<h1>a</h1>'
      )
    }
  )

  await t.test(
    'should support list (ordered) (`1.` -> `<ol><li>`)',
    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(await run(await compile('1.')))
        ),
        '<ol>\n<li></li>\n</ol>'
      )
    }
  )

  await t.test(
    'should support list (unordered) (`*` -> `<ul><li>`)',
    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(await run(await compile('*')))
        ),
        '<ul>\n<li></li>\n</ul>'
      )
    }
  )

  await t.test('should support strong (`**` -> `strong`)', async function () {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(await run(await compile('**a**')))
      ),
      '<p><strong>a</strong></p>'
    )
  })

  await t.test(
    'should support thematic break (`***` -> `<hr>`)',
    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(await run(await compile('***')))
        ),
        '<hr/>'
      )
    }
  )
})

test('@mdx-js/mdx: syntax: markdown (GFM, `remark-gfm`)', async function (t) {
  await t.test(
    'should support links (autolink literal) (`http://a` -> `a`)',
    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(
            await run(await compile('http://a', {remarkPlugins: [remarkGfm]}))
          )
        ),
        '<p><a href="http://a">http://a</a></p>'
      )
    }
  )

  await t.test(
    'should support footnotes (`[^a]` -> `<sup><a…>`)',
    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(
            await run(
              await compile('[^a]\n[^a]: b', {remarkPlugins: [remarkGfm]})
            )
          )
        ),
        `<p><sup><a href="#user-content-fn-a" id="user-content-fnref-a" data-footnote-ref="true" aria-describedby="footnote-label">1</a></sup></p>
<section data-footnotes="true" class="footnotes"><h2 class="sr-only" id="footnote-label">Footnotes</h2>
<ol>
<li id="user-content-fn-a">
<p>b <a href="#user-content-fnref-a" data-footnote-backref="" aria-label="Back to reference 1" class="data-footnote-backref">↩</a></p>
</li>
</ol>
</section>`
      )
    }
  )

  await t.test(
    'should support tables (`| a |` -> `<table>...`)',
    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(
            await run(
              await compile('| a |\n| - |', {remarkPlugins: [remarkGfm]})
            )
          )
        ),
        '<table><thead><tr><th>a</th></tr></thead></table>'
      )
    }
  )

  await t.test(
    'should support task lists (`* [x]` -> `input`)',
    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(
            await run(
              await compile('* [x] a\n* [ ] b', {remarkPlugins: [remarkGfm]})
            )
          )
        ),
        '<ul class="contains-task-list">\n<li class="task-list-item"><input type="checkbox" disabled="" checked=""/> a</li>\n<li class="task-list-item"><input type="checkbox" disabled=""/> b</li>\n</ul>'
      )
    }
  )

  await t.test(
    'should support strikethrough (`~` -> `del`)',
    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(
            await run(await compile('~a~', {remarkPlugins: [remarkGfm]}))
          )
        ),
        '<p><del>a</del></p>'
      )
    }
  )
})

test('@mdx-js/mdx: syntax: markdown (GFM footnotes, `remark-gfm`, `remark-rehype` options)', async function (t) {
  await t.test('should support `remark-rehype` options', async function () {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(
          await run(
            await compile('Text[^1]\n\n[^1]: Note.', {
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
<p>Note. <a href="#user-content-fnref-1" data-footnote-backref="" aria-label="Back" class="data-footnote-backref">↩</a></p>
</li>
</ol>
</section>`,
      'should pass options to remark-rehype'
    )
  })
})

test('@mdx-js/mdx: syntax: markdown (frontmatter, `remark-frontmatter`)', async function (t) {
  await t.test('should support frontmatter (YAML)', async function () {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(
          await run(
            await compile('---\na: b\n---\nc', {
              remarkPlugins: [remarkFrontmatter]
            })
          )
        )
      ),
      '<p>c</p>'
    )
  })

  await t.test('should support frontmatter (TOML)', async function () {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(
          await run(
            await compile('+++\na: b\n+++\nc', {
              remarkPlugins: [[remarkFrontmatter, 'toml']]
            })
          )
        )
      ),
      '<p>c</p>'
    )
  })
})

test('@mdx-js/mdx: syntax: markdown (math, `remark-math`, `rehype-katex`)', async function (t) {
  await t.test('should support math', async function () {
    assert.match(
      renderToStaticMarkup(
        React.createElement(
          await run(
            await compile('$C_L$', {
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
})

test('@mdx-js/mdx: syntax: markdown (directive, `remark-directive`)', async function (t) {
  await t.test('should support directives', async function () {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(
          await run(
            await compile(':span[*text*]{.red}', {
              remarkPlugins: [remarkDirective, plugin]
            })
          )
        )
      ),
      '<p><span class="red"><em>text</em></span></p>'
    )
  })

  function plugin() {
    /**
     * @param {MdastRoot} tree
     *   Tree.
     * @returns {undefined}
     *   Nothing.
     */
    return function (tree) {
      visit(tree, function (node) {
        if (
          node.type === 'containerDirective' ||
          node.type === 'leafDirective' ||
          node.type === 'textDirective'
        ) {
          const element = h(node.name, node.attributes || {})
          node.data = {
            hName: element.tagName,
            hProperties: element.properties
          }
        }
      })
    }
  }
})

test('@mdx-js/mdx: syntax: MDX (JSX)', async function (t) {
  await t.test('should support JSX (text)', async function () {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(await run(await compile('a <s>b</s>')))
      ),
      '<p>a <s>b</s></p>'
    )
  })

  await t.test('should support JSX (flow)', async function () {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(await run(await compile('<div>\n  b\n</div>')))
      ),
      '<div><p>b</p></div>'
    )
  })

  await t.test('should unravel JSX (text) as an only child', async function () {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(await run(await compile('<h1>b</h1>')))
      ),
      '<h1>b</h1>'
    )
  })

  await t.test('should unravel JSX (text) as only children', async function () {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(await run(await compile('<a>b</a><b>c</b>')))
      ),
      '<a>b</a>\n<b>c</b>'
    )
  })

  await t.test(
    'should unravel JSX (text) and whitespace as only children',
    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(await run(await compile('<a>b</a>\t<b>c</b>')))
        ),
        '<a>b</a>\n<b>c</b>'
      )
    }
  )

  await t.test(
    'should unravel expression (text) as an only child',
    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(await run(await compile('{1}')))
        ),
        '1'
      )
    }
  )

  await t.test(
    'should unravel expression (text) as only children',
    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(await run(await compile('{1}{2}')))
        ),
        '1\n2'
      )
    }
  )

  await t.test(
    'should unravel expression (text) and whitespace as only children',
    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(await run(await compile('{1}\n{2}')))
        ),
        '1\n2'
      )
    }
  )

  await t.test('should support JSX (text, fragment)', async function () {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(await run(await compile('a <>b</>')))
      ),
      '<p>a b</p>'
    )
  })

  await t.test('should support JSX (flow, fragment)', async function () {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(await run(await compile('<>\n  b\n</>')))
      ),
      '<p>b</p>'
    )
  })

  await t.test('should support JSX (namespace)', async function () {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(await run(await compile('a <x:y>b</x:y>')))
      ),
      '<p>a <x:y>b</x:y></p>'
    )
  })

  await t.test('should support expressions in MDX (text)', async function () {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(
          await run(await compile('export const a = 1\n\na {a}'))
        )
      ),
      '<p>a 1</p>'
    )
  })

  await t.test('should support expressions in MDX (flow)', async function () {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(await run(await compile('{\n  1 + 1\n}')))
      ),
      '2'
    )
  })

  await t.test('should support empty expressions in MDX', async function () {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(await run(await compile('{/*!*/}')))
      ),
      ''
    )
  })

  await t.test('should support JSX attribute names', async function () {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(
          await run(await compile('<x a="1" b:c="1" hidden />'))
        )
      ),
      '<x a="1" b:c="1" hidden=""></x>'
    )
  })

  await t.test('should support JSX attribute values', async function () {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(
          await run(await compile('<x y="1" z=\'w\' style={{color: "red"}} />'))
        )
      ),
      '<x y="1" z="w" style="color:red"></x>'
    )
  })

  await t.test('should support JSX spread attributes', async function () {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(await run(await compile('<x {...{a: 1}} />')))
      ),
      '<x a="1"></x>'
    )
  })

  await t.test('should support JSX in expressions', async function () {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(
          await run(
            await compile('{<i>the sum of one and one is: {1 + 1}</i>}')
          )
        )
      ),
      '<i>the sum of one and one is: 2</i>'
    )
  })

  await t.test('should not include whitespace in tables', async function () {
    // Important: there should not be whitespace in the `tr`.
    // This is normally not present, but unraveling makes this a bit more complex.
    // See: <https://github.com/mdx-js/mdx/issues/2000>.
    assert.equal(
      String(
        await compile(`<table>
  <thead>
    <tr>
      <th>a</th>
      <th>b</th>
    </tr>
  </thead>
</table>`)
      ),
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
        '  return MDXLayout ? _jsx(MDXLayout, {',
        '    ...props,',
        '    children: _jsx(_createMdxContent, {',
        '      ...props',
        '    })',
        '  }) : _createMdxContent(props);',
        '}',
        'export default MDXContent;',
        ''
      ].join('\n')
    )
  })
})

test('@mdx-js/mdx: syntax: MDX (ESM)', async function (t) {
  await t.test('should support importing components w/ ESM', async function () {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(
          await run(
            await compile(
              'import {Pill} from "./components.js"\n\n<Pill>!</Pill>'
            )
          )
        )
      ),
      '<span style="color:red">!</span>'
    )
  })

  await t.test('should support importing data w/ ESM', async function () {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(
          await run(
            await compile('import {number} from "./data.js"\n\n{number}')
          )
        )
      ),
      '3.14'
    )
  })

  await t.test('should support exporting w/ ESM', async function () {
    const mod = await runWhole(await compile('export const number = Math.PI'))

    assert.equal(mod.number, Math.PI)
  })

  await t.test(
    'should support exporting an identifier w/o a value',
    async function () {
      assert.ok('a' in (await runWhole(await compile('export var a'))))
    }
  )

  await t.test('should support exporting an object pattern', async function () {
    const mod = await runWhole(
      await compile('import {object} from "./data.js"\nexport var {a} = object')
    )

    assert.equal(mod.a, 1)
  })

  await t.test(
    'should support exporting a rest element in an object pattern',
    async function () {
      const mod = await runWhole(
        await compile(
          'import {object} from "./data.js"\nexport var {a, ...rest} = object'
        )
      )

      assert.deepEqual(mod.rest, {b: 2})
    }
  )

  await t.test(
    'should support exporting an assignment pattern in an object pattern',
    async function () {
      const mod = await runWhole(
        await compile(
          'import {object} from "./data.js"\nexport var {c = 3} = object'
        )
      )

      assert.equal(mod.c, 3)
    }
  )

  await t.test('should support exporting an array pattern', async function () {
    const mod = await runWhole(
      await compile('import {array} from "./data.js"\nexport var [a] = array')
    )

    assert.equal(mod.a, 1)
  })

  await t.test('should support `export as` w/ ESM', async function () {
    const mod = await runWhole(
      await compile('export const number = Math.PI\nexport {number as pi}')
    )

    assert.equal(mod.pi, Math.PI)
  })

  await t.test(
    'should support default export to define a layout',
    async function () {
      const Content = await run(
        await compile(
          'export default function Layout(props) { return <div {...props} /> }\n\na'
        )
      )

      assert.equal(
        renderToStaticMarkup(React.createElement(Content)),
        '<div><p>a</p></div>'
      )
    }
  )

  await t.test(
    'should support default export from a source',
    async function () {
      const Content = await run(
        await compile('export {Layout as default} from "./components.js"\n\na')
      )

      assert.equal(
        renderToStaticMarkup(React.createElement(Content)),
        '<div style="color:red"><p>a</p></div>'
      )
    }
  )

  await t.test(
    'should support rexporting something as a default export from a source',
    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(
            await run(
              await compile('export {default} from "./components.js"\n\na')
            )
          )
        ),
        '<div style="color:red"><p>a</p></div>'
      )
    }
  )

  await t.test(
    'should support rexporting the default export from a source',
    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(
            await run(
              await compile('export {default} from "./components.js"\n\na')
            )
          )
        ),
        '<div style="color:red"><p>a</p></div>'
      )
    }
  )

  await t.test(
    'should support rexporting the default export from a source',
    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(
            await run(
              await compile('export {default} from "./components.js"\n\na')
            )
          )
        ),
        '<div style="color:red"><p>a</p></div>'
      )
    }
  )

  await t.test(
    'should support rexporting the default export, and other things, from a source',
    async function () {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(
            await run(
              await compile(
                'export {default, Pill} from "./components.js"\n\na'
              )
            )
          )
        ),
        '<div style="color:red"><p>a</p></div>'
      )
    }
  )

  await t.test('should support the jsx dev runtime', async function () {
    assert.equal(
      String(
        await compile(
          {value: '<X />', path: 'path/to/file.js'},
          {development: true}
        )
      ),
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
        '  return MDXLayout ? _jsxDEV(MDXLayout, {',
        '    ...props,',
        '    children: _jsxDEV(_createMdxContent, {',
        '      ...props',
        '    }, undefined, false, {',
        '      fileName: "path/to/file.js"',
        '    }, this)',
        '  }, undefined, false, {',
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
