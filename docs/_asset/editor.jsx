/* @jsxRuntime automatic @jsxImportSource react */

/**
 * @typedef {import('@wooorm/starry-night').Grammar} Grammar
 * @typedef {import('mdx/types.js').MDXModule} MDXModule
 * @typedef {import('react-error-boundary').FallbackProps} FallbackProps
 * @typedef {import('unified').PluggableList} PluggableList
 * @typedef {import('unist').Node} UnistNode
 */

/**
 * @typedef EvalOk
 * @property {true} ok
 * @property {JSX.Element} value
 *
 * @typedef EvalNok
 * @property {false} ok
 * @property {Error} value
 *
 * @typedef {EvalOk | EvalNok} EvalResult
 */

import {compile, nodeTypes, run} from '@mdx-js/mdx'
import {createStarryNight} from '@wooorm/starry-night'
import sourceCss from '@wooorm/starry-night/source.css'
import sourceJs from '@wooorm/starry-night/source.js'
import sourceJson from '@wooorm/starry-night/source.json'
import sourceMdx from '@wooorm/starry-night/source.mdx'
import sourceTs from '@wooorm/starry-night/source.ts'
import sourceTsx from '@wooorm/starry-night/source.tsx'
import textHtmlBasic from '@wooorm/starry-night/text.html.basic'
import textMd from '@wooorm/starry-night/text.md'
import {visit as visitEstree} from 'estree-util-visit'
import {toJsxRuntime} from 'hast-util-to-jsx-runtime'
import {useEffect, useState} from 'react'
// @ts-expect-error: untyped.
import {Fragment, jsx, jsxs} from 'react/jsx-runtime'
import ReactDom from 'react-dom/client'
import {ErrorBoundary} from 'react-error-boundary'
import rehypeRaw from 'rehype-raw'
import remarkDirective from 'remark-directive'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import {removePosition} from 'unist-util-remove-position'
import {visit} from 'unist-util-visit'
import {VFile} from 'vfile'

const runtime = {Fragment, jsx, jsxs}

const sample = `# Hello, world!

Below is an example of markdown in JSX.

<div style={{padding: '1rem', backgroundColor: 'violet'}}>
  Try and change the background color to \`tomato\`.
</div>`

/** @type {ReadonlyArray<Grammar>} */
const grammars = [
  sourceCss,
  sourceJs,
  // @ts-expect-error: TS is wrong: this is not a JSON file.
  sourceJson,
  sourceMdx,
  sourceTs,
  sourceTsx,
  textHtmlBasic,
  textMd
]

/** @type {Awaited<ReturnType<typeof createStarryNight>>} */
let starryNight

const body = document.querySelector('.body')

if (body && window.location.pathname === '/playground/') {
  const root = document.createElement('div')
  root.classList.add('playground')
  body.after(root)
  init(root)
}

/**
 * @param {Element} main
 */
function init(main) {
  const root = ReactDom.createRoot(main)

  createStarryNight(grammars).then(
    /**
     * @returns {undefined}
     */
    function (x) {
      starryNight = x

      const missing = starryNight.missingScopes()
      if (missing.length > 0) {
        throw new Error('Unexpected missing required scopes: `' + missing + '`')
      }

      root.render(<Playground />)
    }
  )
}

function Playground() {
  const [value, setValue] = useState(sample)
  const [directive, setDirective] = useState(false)
  const [frontmatter, setFrontmatter] = useState(false)
  const [gfm, setGfm] = useState(false)
  const [markdown, setMarkdown] = useState(false)
  const [math, setMath] = useState(false)
  const [raw, setRaw] = useState(false)
  const [positions, setPositions] = useState(false)
  const [output, setOutput] = useState('result')
  const [evalResult, setEvalResult] = useState(
    /** @type {unknown} */ (undefined)
  )

  useEffect(
    function () {
      go().then(
        function (ok) {
          setEvalResult({ok: true, value: ok})
        },
        /**
         * @param {Error} error
         */
        function (error) {
          setEvalResult({ok: false, value: error})
        }
      )

      async function go() {
        /** @type {PluggableList} */
        const recmaPlugins = []
        /** @type {PluggableList} */
        const rehypePlugins = []
        /** @type {PluggableList} */
        const remarkPlugins = []

        if (directive) remarkPlugins.unshift(remarkDirective)
        if (frontmatter) remarkPlugins.unshift(remarkFrontmatter)
        if (gfm) remarkPlugins.unshift(remarkGfm)
        if (math) remarkPlugins.unshift(remarkMath)
        if (raw) rehypePlugins.unshift([rehypeRaw, {passThrough: nodeTypes}])

        const file = new VFile({
          basename: markdown ? 'example.md' : 'example.mdx',
          value
        })

        if (output === 'mdast') remarkPlugins.push([capture, {name: 'mdast'}])
        if (output === 'hast') rehypePlugins.push([capture, {name: 'hast'}])
        if (output === 'esast') recmaPlugins.push([capture, {name: 'esast'}])
        /** @type {UnistNode | undefined} */
        let tree

        await compile(file, {
          outputFormat: output === 'result' ? 'function-body' : 'program',
          recmaPlugins,
          rehypePlugins,
          remarkPlugins,
          useDynamicImport: true
        })

        if (output === 'result') {
          /** @type {MDXModule} */
          const mod = await run(String(file), runtime)

          return (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <div className="playground-result">{mod.default({})}</div>
            </ErrorBoundary>
          )
        }

        if (tree) {
          return (
            <pre>
              <code>
                {toJsxRuntime(
                  starryNight.highlight(
                    JSON.stringify(tree, undefined, 2),
                    'source.json'
                  ),
                  runtime
                )}
              </code>
            </pre>
          )
        }

        // `output === 'code'`
        return (
          <pre>
            <code>
              {toJsxRuntime(
                starryNight.highlight(String(file), 'source.js'),
                runtime
              )}
            </code>
          </pre>
        )

        /**
         * @param {{name: string}} options
         */
        function capture(options) {
          /**
           * @param {UnistNode} node
           */
          return function (node) {
            const clone = structuredClone(node)

            if (!positions) {
              if (options.name === 'esast') {
                cleanEstree(clone)
              } else {
                cleanUnistTree(clone)
              }
            }

            tree = clone
          }
        }
      }
    },
    [directive, frontmatter, gfm, markdown, math, output, positions, raw, value]
  )

  const scope = markdown ? 'text.md' : 'source.mdx'
  const compiledResult = /** @type {EvalResult | undefined} */ (evalResult)
  /** @type {JSX.Element | undefined} */
  let display

  if (compiledResult) {
    if (compiledResult.ok) {
      display = compiledResult.value
    } else {
      display = (
        <div>
          <p>Could not compile code:</p>
          <DisplayError error={compiledResult.value} />
        </div>
      )
    }
  }

  return (
    <>
      <form className="playground-editor">
        <div className="playground-area">
          <div className="playground-inner">
            <div className="playground-draw">
              {toJsxRuntime(starryNight.highlight(value, scope), runtime)}
              {/* Trailing whitespace in a `textarea` is shown, but not in a `div`
          with `white-space: pre-wrap`.
          Add a `br` to make the last newline explicit. */}
              {/\n[ \t]*$/.test(value) ? <br /> : undefined}
            </div>
            <textarea
              spellCheck="false"
              className="playground-write"
              value={value}
              rows={value.split('\n').length + 1}
              onChange={function (event) {
                setValue(event.target.value)
              }}
            />
          </div>
        </div>
        <div className="playground-controls">
          <fieldset>
            <legend>Output</legend>
            <label>
              <select
                name="output"
                onChange={function (event) {
                  setOutput(event.target.value)
                }}
              >
                <option value="result">rendered result</option>
                <option value="code">compiled code</option>
                <option value="mdast">mdast (markdown)</option>
                <option value="hast">hast (html)</option>
                <option value="esast">esast (javascript)</option>
              </select>{' '}
              result
            </label>
          </fieldset>
          <fieldset>
            <legend>Input</legend>
            <label>
              <input
                type="radio"
                name="language"
                checked={!markdown}
                onChange={function () {
                  setMarkdown(false)
                }}
              />{' '}
              MDX
            </label>
            <label>
              <input
                type="radio"
                name="language"
                checked={markdown}
                onChange={function () {
                  setMarkdown(true)
                }}
              />{' '}
              markdown
            </label>
          </fieldset>
          <fieldset>
            <legend>Plugin</legend>
            <label>
              <input
                type="checkbox"
                name="directive"
                checked={directive}
                onChange={function () {
                  setDirective(!directive)
                }}
              />{' '}
              use{' '}
              <a href="https://github.com/remarkjs/remark-directive">
                <code>remark-directive</code>
              </a>
            </label>
            <label>
              <input
                type="checkbox"
                name="frontmatter"
                checked={frontmatter}
                onChange={function () {
                  setFrontmatter(!frontmatter)
                }}
              />{' '}
              use{' '}
              <a href="https://github.com/remarkjs/remark-frontmatter">
                <code>remark-frontmatter</code>
              </a>
            </label>
            <label>
              <input
                type="checkbox"
                name="gfm"
                checked={gfm}
                onChange={function () {
                  setGfm(!gfm)
                }}
              />{' '}
              use{' '}
              <a href="https://github.com/remarkjs/remark-gfm">
                <code>remark-gfm</code>
              </a>
            </label>
            <label>
              <input
                type="checkbox"
                name="math"
                checked={math}
                onChange={function () {
                  setMath(!math)
                }}
              />{' '}
              use{' '}
              <a href="https://github.com/remarkjs/remark-math">
                <code>remark-math</code>
              </a>
            </label>
            <label>
              <input
                type="checkbox"
                name="raw"
                checked={raw}
                onChange={function () {
                  setRaw(!raw)
                }}
              />{' '}
              use{' '}
              <a href="https://github.com/rehypejs/rehype-raw">
                <code>rehype-raw</code>
              </a>
            </label>
          </fieldset>
          <fieldset>
            <legend>Tree</legend>
            <label>
              <input
                type="checkbox"
                name="positions"
                checked={positions}
                onChange={function () {
                  setPositions(!positions)
                }}
              />{' '}
              show <code>position</code> in tree
            </label>
          </fieldset>
        </div>
      </form>
      {display}
    </>
  )
}

/**
 *
 * @param {FallbackProps} props
 * @returns {JSX.Element}
 */
function ErrorFallback(props) {
  console.log('fb:', arguments)
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <DisplayError error={props.error} />
      <button type="button" onClick={props.resetErrorBoundary}>
        Try again
      </button>
    </div>
  )
}

/**
 *
 * @param {{error: Error}} props
 * @returns {JSX.Element}
 */
function DisplayError(props) {
  return (
    <pre>
      <code>{String(props.error.stack || props.error)}</code>
    </pre>
  )
}

/**
 * @param {UnistNode} node
 */
function cleanUnistTree(node) {
  removePosition(node, {force: true})

  visit(node, function (node) {
    if (
      node.type === 'mdxJsxAttribute' &&
      'value' in node &&
      node.value &&
      typeof node.value === 'object'
    ) {
      // @ts-expect-error: unist.
      cleanUnistTree(node.value)
    }

    if (
      'attributes' in node &&
      node.attributes &&
      Array.isArray(node.attributes)
    ) {
      for (const attr of node.attributes) {
        cleanUnistTree(attr)
      }
    }

    if (node.data && node.data.estree) {
      // @ts-expect-error: estree.
      visitEstree(node.data.estree, removeFromEstree)
    }
  })
}

/**
 * @param {UnistNode} node
 */
function cleanEstree(node) {
  // @ts-expect-error: fine.
  visitEstree(node, removeFromEstree)
}

/**
 * @param {UnistNode} node
 */
function removeFromEstree(node) {
  // @ts-expect-error: untyped.
  delete node.loc
  // @ts-expect-error: untyped.
  delete node.start
  // @ts-expect-error: untyped.
  delete node.end
  // @ts-expect-error: untyped.
  delete node.range
}
