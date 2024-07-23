import assert from 'node:assert/strict'
import {test} from 'node:test'
import {evaluate, evaluateSync, compile} from '@mdx-js/mdx'
import * as provider from '@mdx-js/react'
import {renderToStaticMarkup} from 'react-dom/server'
import * as runtime from 'react/jsx-runtime'
import * as developmentRuntime from 'react/jsx-dev-runtime'
import React from 'react'

test('@mdx-js/mdx: evaluate', async function (t) {
  await t.test('should throw on missing `Fragment`', async function () {
    try {
      // @ts-expect-error: check how the runtime handles missing options.
      await evaluate('a')
      assert.fail()
    } catch (error) {
      assert.match(String(error), /Expected `Fragment` given to `evaluate`/)
    }
  })

  await t.test('should throw on missing `jsx`', async function () {
    try {
      await evaluate('a', {Fragment: runtime.Fragment})
      assert.fail()
    } catch (error) {
      assert.match(String(error), /Expected `jsx` given to `evaluate`/)
    }
  })

  await t.test('should throw on missing `jsxs`', async function () {
    try {
      await evaluate('a', {Fragment: runtime.Fragment, jsx: runtime.jsx})
      assert.fail()
    } catch (error) {
      assert.match(String(error), /Expected `jsxs` given to `evaluate`/)
    }
  })

  await t.test(
    'should throw on missing `jsxDEV` in dev mode',
    async function () {
      try {
        await evaluate('a', {Fragment: runtime.Fragment, development: true})
        assert.fail()
      } catch (error) {
        assert.match(String(error), /Expected `jsxDEV` given to `evaluate`/)
      }
    }
  )

  await t.test('should evaluate', async function () {
    const result = await evaluate('# hi!', runtime)

    assert.equal(
      renderToStaticMarkup(React.createElement(result.default)),
      '<h1>hi!</h1>'
    )
  })

  await t.test('should evaluate (sync)', async function () {
    const result = evaluateSync('# hi!', runtime)

    assert.equal(
      renderToStaticMarkup(React.createElement(result.default)),
      '<h1>hi!</h1>'
    )
  })

  await t.test('should evaluate (dev)', async function () {
    const result = await evaluate('# hi dev!', {
      development: true,
      ...developmentRuntime
    })

    assert.equal(
      renderToStaticMarkup(React.createElement(result.default)),
      '<h1>hi dev!</h1>'
    )
  })

  await t.test('should evaluate (async, dev)', async function () {
    const result = await evaluate('# hi dev!', {
      development: true,
      ...developmentRuntime
    })

    assert.equal(
      renderToStaticMarkup(React.createElement(result.default)),
      '<h1>hi dev!</h1>'
    )
  })

  await t.test(
    'should throw a runtime error when using `import` w/o `baseUrl`',
    async function () {
      try {
        await evaluate('import "a"', runtime)
        assert.fail()
      } catch (error) {
        const cause = /** @type {Error} */ (error)
        assert.match(
          String(cause),
          /Unexpected missing `options.baseUrl` needed to support/
        )
      }
    }
  )

  await t.test(
    'should throw a runtime error when using `export … from` w/o `baseUrl`',
    async function () {
      try {
        await evaluate('export {a} from "b"', runtime)
        assert.fail()
      } catch (error) {
        const cause = /** @type {Error} */ (error)
        assert.match(
          String(cause),
          /Unexpected missing `options.baseUrl` needed to support/
        )
      }
    }
  )

  await t.test(
    'should throw a runtime error when using `export … from` w/o `baseUrl`',
    async function () {
      try {
        await evaluate('{import.meta.url}', runtime)
        assert.fail()
      } catch (error) {
        const cause = /** @type {Error} */ (error)
        assert.match(
          String(cause),
          /Unexpected missing `options.baseUrl` needed to support/
        )
      }
    }
  )

  await t.test(
    'should support an `import` of a relative url w/ `baseUrl`',
    async function () {
      const result = await evaluate(
        'import {number} from "./context/data.js"\n\n{number}',
        {baseUrl: import.meta.url, ...runtime}
      )

      assert.equal(
        renderToStaticMarkup(React.createElement(result.default)),
        '3.14'
      )
    }
  )

  await t.test(
    'should support an `import` of a full url w/ `baseUrl`',
    async function () {
      const result = await evaluate(
        'import {number} from "' +
          new URL('context/data.js', import.meta.url) +
          '"\n\n{number}',
        {baseUrl: import.meta.url, ...runtime}
      )

      assert.equal(
        renderToStaticMarkup(React.createElement(result.default)),
        '3.14'
      )
    }
  )

  await t.test(
    'should support an `import` w/o specifiers w/o `baseUrl` (expecting it at runtime)',
    async function () {
      const document = String(
        await compile('import "a"', {outputFormat: 'function-body'})
      )
      assert.match(document, /const _importMetaUrl = arguments\[0]\.baseUrl/)
      assert.match(
        document,
        /await import\(_resolveDynamicMdxSpecifier\("a"\)\);/
      )
    }
  )

  await t.test(
    'should support an `import` w/ 0 specifiers w/o `baseUrl` (expecting it at runtime)',
    async function () {
      const document = String(
        await compile('import {} from "a"', {outputFormat: 'function-body'})
      )
      assert.match(document, /const _importMetaUrl = arguments\[0]\.baseUrl/)
      assert.match(
        document,
        /await import\(_resolveDynamicMdxSpecifier\("a"\)\);/
      )
    }
  )

  await t.test(
    'should support a namespace import w/ `baseUrl`',
    async function () {
      const result = await evaluate(
        'import * as x from "./context/components.js"\n\n<x.Pill>Hi!</x.Pill>',
        {baseUrl: import.meta.url, ...runtime}
      )

      assert.equal(
        renderToStaticMarkup(React.createElement(result.default)),
        '<span style="color:red">Hi!</span>'
      )
    }
  )

  await t.test(
    'should support a namespace import and a bare specifier w/ `baseUrl`',
    async function () {
      const result = await evaluate(
        'import Div, * as x from "./context/components.js"\n\n<x.Pill>a</x.Pill> and <Div>b</Div>',
        {baseUrl: import.meta.url, ...runtime}
      )

      assert.equal(
        renderToStaticMarkup(React.createElement(result.default)),
        '<p><span style="color:red">a</span> and <div style="color:red">b</div></p>'
      )
    }
  )

  await t.test('should support an `export`', async function () {
    const result = await evaluate('export const a = 1\n\n{a}', runtime)

    assert.equal(renderToStaticMarkup(React.createElement(result.default)), '1')

    assert.equal(result.a, 1)
  })

  await t.test('should support an `export function`', async function () {
    const result = await evaluate(
      'export function a() { return 1 }\n\n{a()}',
      runtime
    )

    assert.equal(renderToStaticMarkup(React.createElement(result.default)), '1')

    assert.ok(typeof result.a === 'function')

    assert.equal(result.a(), 1)
  })

  await t.test('should support an `export class`', async function () {
    const result = await evaluate(
      'export class A { constructor() { this.b = 1 } }\n\n{new A().b}',
      runtime
    )

    assert.equal(renderToStaticMarkup(React.createElement(result.default)), '1')

    const A = /** @type {new () => {b: number}} */ (result.A)
    const a = new A()
    assert.equal(a.b, 1)
  })

  await t.test('should support an `export as`', async function () {
    const result = await evaluate(
      'export const a = 1\nexport {a as b}\n\n{a}',
      runtime
    )

    assert.equal(renderToStaticMarkup(React.createElement(result.default)), '1')

    assert.equal(result.a, 1, 'should support an `export as` (2)')
    assert.equal(result.b, 1, 'should support an `export as` (3)')
  })

  await t.test('should support an `export default`', async function () {
    const result = await evaluate(
      'export default function Layout({components, ...properties}) { return <section {...properties} /> }\n\na',
      runtime
    )

    assert.equal(
      renderToStaticMarkup(React.createElement(result.default)),
      '<section><p>a</p></section>'
    )
  })

  await t.test(
    'should support an `export from` w/ `baseUrl`',
    async function () {
      const result = await evaluate(
        'export {number} from "./context/data.js"',
        {baseUrl: import.meta.url, ...runtime}
      )

      assert.equal(result.number, 3.14)
    }
  )

  await t.test('should support an `export` w/ `baseUrl`', async function () {
    const result = await evaluate(
      'import {number} from "./context/data.js"\nexport {number}',
      {baseUrl: import.meta.url, ...runtime}
    )

    assert.equal(result.number, 3.14)
  })

  await t.test(
    'should support an `export as from` w/ `baseUrl`',
    async function () {
      const result = await evaluate(
        'export {number as data} from "./context/data.js"',
        {baseUrl: import.meta.url, ...runtime}
      )

      assert.equal(result.data, 3.14)
    }
  )

  await t.test(
    'should support an `export default as from` w/ `baseUrl`',
    async function () {
      const result = await evaluate(
        'export {default as data} from "./context/data.js"',
        {baseUrl: import.meta.url, ...runtime}
      )

      assert.equal(result.data, 6.28)
    }
  )

  await t.test(
    'should support an `export all from` w/ `baseUrl`',
    async function () {
      const result = await evaluate('export * from "./context/data.js"', {
        baseUrl: import.meta.url,
        ...runtime
      })

      assert.deepEqual(
        {...result, default: undefined},
        {array: [1, 2], default: undefined, number: 3.14, object: {a: 1, b: 2}}
      )
    }
  )

  await t.test(
    'should support an `export * from`, but prefer explicit exports, w/ `baseUrl`',
    async function () {
      const result = await evaluate(
        'export {default as number} from "./context/data.js"\nexport * from "./context/data.js"',
        {baseUrl: import.meta.url, ...runtime}
      )

      // I’m not sure if this makes sense, but it is how Node works.
      assert.deepEqual(
        {...result, default: undefined},
        {array: [1, 2], default: undefined, number: 6.28, object: {a: 1, b: 2}}
      )
    }
  )

  await t.test(
    'should support rewriting `import.meta.url` w/ `baseUrl`',
    async function () {
      const result = await evaluate(
        'export const x = new URL("example.png", import.meta.url).href',
        {baseUrl: 'https://example.com', ...runtime}
      )

      assert.equal(result.x, 'https://example.com/example.png')
    }
  )

  await t.test(
    'should support rewriting `import.meta.url` w/ `baseUrl` as an URL',
    async function () {
      const result = await evaluate(
        'export const x = new URL("example.png", import.meta.url).href',
        {baseUrl: new URL('https://example.com'), ...runtime}
      )

      assert.equal(result.x, 'https://example.com/example.png')
    }
  )

  await t.test('should support a given components', async function () {
    const result = await evaluate('<X/>', runtime)

    assert.equal(
      renderToStaticMarkup(
        React.createElement(result.default, {
          components: {
            X() {
              return React.createElement('span', {}, '!')
            }
          }
        })
      ),
      '<span>!</span>'
    )
  })

  await t.test(
    'should support a provider w/ `useMDXComponents`',
    async function () {
      const result = await evaluate('<X/>', {...runtime, ...provider})

      assert.equal(
        renderToStaticMarkup(
          React.createElement(
            provider.MDXProvider,
            {
              components: {
                X() {
                  return React.createElement('span', {}, '!')
                }
              }
            },
            React.createElement(result.default)
          )
        ),
        '<span>!</span>'
      )
    }
  )
})
