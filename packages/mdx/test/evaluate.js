import assert from 'node:assert/strict'
import {test} from 'node:test'
import {evaluate, evaluateSync, compile} from '../index.js'
// @ts-expect-error: make sure a single react is used.
import {renderToStaticMarkup as renderToStaticMarkup_} from '../../react/node_modules/react-dom/server.js'
// @ts-expect-error: make sure a single react is used.
import * as runtime_ from '../../react/node_modules/react/jsx-runtime.js'
// @ts-expect-error: make sure a single react is used.
import * as devRuntime from '../../react/node_modules/react/jsx-dev-runtime.js'
// @ts-expect-error: make sure a single react is used.
import React_ from '../../react/node_modules/react/index.js'
import * as provider from '../../react/index.js'

/** @type {import('react-dom/server').renderToStaticMarkup} */
const renderToStaticMarkup = renderToStaticMarkup_

/** @type {{Fragment: unknown, jsx: unknown, jsxs: unknown}} */
const runtime = runtime_

/** @type {import('react')} */
const React = React_

test('evaluate', async (t) => {
  await t.test('should throw on missing `Fragment`', async () => {
    assert.throws(() => {
      // @ts-expect-error: missing required arguments
      evaluateSync('a')
    }, /Expected `Fragment` given to `evaluate`/)
  })

  await t.test('should throw on missing `jsx`', async () => {
    assert.throws(() => {
      evaluateSync('a', {Fragment: runtime.Fragment})
    }, /Expected `jsx` given to `evaluate`/)
  })

  await t.test('should throw on missing `jsxs`', async () => {
    assert.throws(() => {
      evaluateSync('a', {Fragment: runtime.Fragment, jsx: runtime.jsx})
    }, /Expected `jsxs` given to `evaluate`/)
  })

  await t.test('should throw on missing `jsxDEV` in dev mode', async () => {
    assert.throws(() => {
      evaluateSync('a', {Fragment: runtime.Fragment, development: true})
    }, /Expected `jsxDEV` given to `evaluate`/)
  })

  await t.test('should evaluate', async () => {
    assert.equal(
      renderToStaticMarkup(
        React.createElement((await evaluate('# hi!', runtime)).default)
      ),
      '<h1>hi!</h1>'
    )
  })

  await t.test('should evaluate (sync)', async () => {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(evaluateSync('# hi!', runtime).default)
      ),
      '<h1>hi!</h1>'
    )
  })

  await t.test('should evaluate (sync)', async () => {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(
          (await evaluate('# hi dev!', {development: true, ...devRuntime}))
            .default
        )
      ),
      '<h1>hi dev!</h1>'
    )
  })

  await t.test('should evaluate (sync)', async () => {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(
          evaluateSync('# hi dev!', {development: true, ...devRuntime}).default
        )
      ),
      '<h1>hi dev!</h1>'
    )
  })

  await t.test(
    'should support an `import` of a relative url w/ `useDynamicImport`',
    async () => {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(
            (
              await evaluate(
                'import {number} from "./context/data.js"\n\n{number}',
                {baseUrl: import.meta.url, useDynamicImport: true, ...runtime}
              )
            ).default
          )
        ),
        '3.14'
      )
    }
  )

  await t.test(
    'should support an `import` of a full url w/ `useDynamicImport`',
    async () => {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(
            (
              await evaluate(
                'import {number} from "' +
                  new URL('context/data.js', import.meta.url) +
                  '"\n\n{number}',
                {baseUrl: import.meta.url, useDynamicImport: true, ...runtime}
              )
            ).default
          )
        ),
        '3.14'
      )
    }
  )

  await t.test(
    'should support an `import` w/o specifiers w/ `useDynamicImport`',
    async () => {
      assert.match(
        String(
          await compile('import "a"', {
            outputFormat: 'function-body',
            useDynamicImport: true
          })
        ),
        /\nawait import\("a"\);?\n/
      )
    }
  )

  await t.test(
    'should support an `import` w/ 0 specifiers w/ `useDynamicImport`',
    async () => {
      assert.match(
        String(
          await compile('import {} from "a"', {
            outputFormat: 'function-body',
            useDynamicImport: true
          })
        ),
        /\nawait import\("a"\);?\n/
      )
    }
  )

  await t.test(
    'should support a namespace import w/ `useDynamicImport`',
    async () => {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(
            (
              await evaluate(
                'import * as x from "./context/components.js"\n\n<x.Pill>Hi!</x.Pill>',
                {baseUrl: import.meta.url, useDynamicImport: true, ...runtime}
              )
            ).default
          )
        ),
        '<span style="color:red">Hi!</span>'
      )
    }
  )

  await t.test(
    'should support a namespace import and a bare specifier w/ `useDynamicImport`',
    async () => {
      assert.equal(
        renderToStaticMarkup(
          React.createElement(
            (
              await evaluate(
                'import Div, * as x from "./context/components.js"\n\n<x.Pill>a</x.Pill> and <Div>b</Div>',
                {baseUrl: import.meta.url, useDynamicImport: true, ...runtime}
              )
            ).default
          )
        ),
        '<p><span style="color:red">a</span> and <div style="color:red">b</div></p>'
      )
    }
  )

  await t.test('should support an `export`', async () => {
    const mod = await evaluate('export const a = 1\n\n{a}', runtime)

    assert.equal(renderToStaticMarkup(React.createElement(mod.default)), '1')

    assert.equal(mod.a, 1)
  })

  await t.test('should support an `export function`', async () => {
    const mod = await evaluate(
      'export function a() { return 1 }\n\n{a()}',
      runtime
    )

    assert.equal(renderToStaticMarkup(React.createElement(mod.default)), '1')

    assert.ok(typeof mod.a === 'function')

    assert.equal(mod.a(), 1)
  })

  await t.test('should support an `export class`', async () => {
    const mod = await evaluate(
      'export class A { constructor() { this.b = 1 } }\n\n{new A().b}',
      runtime
    )

    assert.equal(renderToStaticMarkup(React.createElement(mod.default)), '1')

    const A = /** @type {new () => {b: number}} */ (mod.A)
    const a = new A()
    assert.equal(a.b, 1)
  })

  await t.test('should support an `export as`', async () => {
    const mod = await evaluate(
      'export const a = 1\nexport {a as b}\n\n{a}',
      runtime
    )

    assert.equal(renderToStaticMarkup(React.createElement(mod.default)), '1')

    assert.equal(mod.a, 1, 'should support an `export as` (2)')
    assert.equal(mod.b, 1, 'should support an `export as` (3)')
  })

  await t.test('should support an `export default`', async () => {
    assert.equal(
      renderToStaticMarkup(
        React.createElement(
          (
            await evaluate(
              'export default function Layout({components, ...props}) { return <section {...props} /> }\n\na',
              runtime
            )
          ).default
        )
      ),
      '<section><p>a</p></section>'
    )
  })

  await t.test('should throw on an export from', () => {
    assert.throws(() => {
      evaluateSync('export {a} from "b"', runtime)
    }, /Cannot use `import` or `export … from` in `evaluate` \(outputting a function body\) by default/)
  })

  await t.test(
    'should support an `export from` w/ `useDynamicImport`',
    async () => {
      assert.equal(
        (
          await evaluate('export {number} from "./context/data.js"', {
            baseUrl: import.meta.url,
            useDynamicImport: true,
            ...runtime
          })
        ).number,
        3.14
      )
    }
  )

  await t.test('should support an `export` w/ `useDynamicImport`', async () => {
    assert.equal(
      (
        await evaluate(
          'import {number} from "./context/data.js"\nexport {number}',
          {baseUrl: import.meta.url, useDynamicImport: true, ...runtime}
        )
      ).number,
      3.14
    )
  })

  await t.test(
    'should support an `export as from` w/ `useDynamicImport`',
    async () => {
      assert.equal(
        (
          await evaluate('export {number as data} from "./context/data.js"', {
            baseUrl: import.meta.url,
            useDynamicImport: true,
            ...runtime
          })
        ).data,
        3.14
      )
    }
  )

  await t.test(
    'should support an `export default as from` w/ `useDynamicImport`',
    async () => {
      assert.equal(
        (
          await evaluate('export {default as data} from "./context/data.js"', {
            baseUrl: import.meta.url,
            useDynamicImport: true,
            ...runtime
          })
        ).data,
        6.28
      )
    }
  )

  await t.test(
    'should support an `export all from` w/ `useDynamicImport`',
    async () => {
      assert.deepEqual(
        {
          ...(await evaluate('export * from "./context/data.js"', {
            baseUrl: import.meta.url,
            useDynamicImport: true,
            ...runtime
          })),
          default: undefined
        },
        {array: [1, 2], default: undefined, number: 3.14, object: {a: 1, b: 2}}
      )
    }
  )

  await t.test(
    'should support an `export all from`, but prefer explicit exports, w/ `useDynamicImport`',
    async () => {
      // I’m not sure if this makes sense, but it is how Node works.
      assert.deepEqual(
        {
          ...(await evaluate(
            'export {default as number} from "./context/data.js"\nexport * from "./context/data.js"',
            {baseUrl: import.meta.url, useDynamicImport: true, ...runtime}
          )),
          default: undefined
        },
        {array: [1, 2], default: undefined, number: 6.28, object: {a: 1, b: 2}}
      )
    }
  )

  await t.test(
    'should support rewriting `import.meta.url` w/ `baseUrl`',
    async () => {
      assert.equal(
        (
          await evaluate(
            'export const x = new URL("example.png", import.meta.url).href',
            {baseUrl: 'https://example.com', ...runtime}
          )
        ).x,
        'https://example.com/example.png'
      )
    }
  )

  await t.test('should throw on an export all from', () => {
    assert.throws(() => {
      evaluateSync('export * from "a"', runtime)
    }, /Cannot use `import` or `export … from` in `evaluate` \(outputting a function body\) by default/)
  })

  await t.test('should throw on an import', () => {
    assert.throws(() => {
      evaluateSync('import {a} from "b"', runtime)
    }, /Cannot use `import` or `export … from` in `evaluate` \(outputting a function body\) by default/)
  })

  await t.test('should throw on an import default', () => {
    assert.throws(() => {
      evaluateSync('import a from "b"', runtime)
    }, /Cannot use `import` or `export … from` in `evaluate` \(outputting a function body\) by default/)
  })

  await t.test('should support a given components', async () => {
    assert.equal(
      renderToStaticMarkup(
        React.createElement((await evaluate('<X/>', runtime)).default, {
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

  await t.test('should support a provider w/ `useMDXComponents`', async () => {
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
          React.createElement(
            (await evaluate('<X/>', {...runtime, ...provider})).default
          )
        )
      ),
      '<span>!</span>'
    )
  })
})
