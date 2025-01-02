/* @jsxRuntime automatic */
/* @jsxImportSource react */

/* eslint-disable unicorn/prefer-global-this */

/**
 * @import {Grammar} from '@wooorm/starry-night'
 * @import {Node as EstreeNode, Program} from 'estree'
 * @import {Nodes as HastNodes, Root as HastRoot} from 'hast'
 * @import {Nodes as MdastNodes, Root as MdastRoot} from 'mdast'
 * @import {
    MdxJsxAttribute,
    MdxJsxAttributeValueExpression,
    MdxJsxExpressionAttribute
 * } from 'mdast-util-mdx-jsx'
 * @import {MDXModule} from 'mdx/types.js'
 * @import {ReactNode} from 'react'
 * @import {FallbackProps} from 'react-error-boundary'
 * @import {PluggableList} from 'unified'
 * @import {Node as UnistNode} from 'unist'
 */

/**
 * @typedef DisplayProperties
 *   Properties.
 * @property {Error} error
 *   Error.
 *
 * @typedef EvalNok
 *   Not OK.
 * @property {false} ok
 *   Whether OK.
 * @property {Error} value
 *   Error.
 *
 * @typedef EvalOk
 *   OK.
 * @property {true} ok
 *   Whether OK.
 * @property {ReactNode} value
 *   Result.
 *
 * @typedef {EvalNok | EvalOk} EvalResult
 *   Result.
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

const sample = `# Hello, world!

Below is an example of markdown in JSX.

<div style={{backgroundColor: 'violet', padding: '1rem'}}>
  Try and change the background color to \`tomato\`.
</div>`

/** @type {ReadonlyArray<Grammar>} */
const grammars = [
  sourceCss,
  sourceJs,
  sourceJson,
  sourceMdx,
  sourceTs,
  sourceTsx,
  textHtmlBasic,
  textMd
]

/** @type {Awaited<ReturnType<typeof createStarryNight>>} */
let starryNight

const editor = document.querySelector('#js-editor')

if (window.location.pathname === '/playground/' && editor) {
  const root = document.createElement('div')
  root.classList.add('playground')
  editor.after(root)
  init(root)
}

/**
 * @param {Element} main
 *   DOM element.
 * @returns {undefined}
 *   Nothing.
 */
function init(main) {
  const root = ReactDom.createRoot(main)

  createStarryNight(grammars).then(
    /**
     * @returns {undefined}
     *   Nothing.
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
  const [directive, setDirective] = useState(false)
  const [evalResult, setEvalResult] = useState(
    // Cast to more easily use actual value.
    /** @type {unknown} */ (undefined)
  )
  const [development, setDevelopment] = useState(false)
  const [frontmatter, setFrontmatter] = useState(false)
  const [gfm, setGfm] = useState(false)
  const [formatMarkdown, setFormatMarkdown] = useState(false)
  const [generateJsx, setGenerateJsx] = useState(false)
  const [math, setMath] = useState(false)
  const [outputFormatFunctionBody, setOutputFormatFunctionBody] =
    useState(false)
  const [positions, setPositions] = useState(false)
  const [raw, setRaw] = useState(false)
  const [show, setShow] = useState('result')
  const [value, setValue] = useState(sample)

  useEffect(
    function () {
      go().then(
        function (ok) {
          setEvalResult({ok: true, value: ok})
        },
        /**
         * @param {Error} error
         *   Error.
         * @returns {undefined}
         *   Nothing.
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
          basename: formatMarkdown ? 'example.md' : 'example.mdx',
          value
        })

        if (show === 'esast') recmaPlugins.push([captureEsast])
        if (show === 'hast') rehypePlugins.push([captureHast])
        if (show === 'mdast') remarkPlugins.push([captureMdast])
        /** @type {UnistNode | undefined} */
        let ast

        await compile(file, {
          development: show === 'result' ? false : development,
          jsx: show === 'code' || show === 'esast' ? generateJsx : false,
          outputFormat:
            show === 'result' || outputFormatFunctionBody
              ? 'function-body'
              : 'program',
          recmaPlugins,
          rehypePlugins,
          remarkPlugins
        })

        if (show === 'result') {
          /** @type {MDXModule} */
          const result = await run(String(file), {
            Fragment,
            jsx,
            jsxs,
            baseUrl: window.location.href
          })

          return (
            <ErrorBoundary
              FallbackComponent={ErrorFallback}
              resetKeys={[value]}
            >
              <div className="playground-result">{result.default({})}</div>
            </ErrorBoundary>
          )
        }

        if (ast) {
          return (
            <pre>
              <code>
                {toJsxRuntime(
                  starryNight.highlight(
                    JSON.stringify(ast, undefined, 2),
                    'source.json'
                  ),
                  {Fragment, jsx, jsxs}
                )}
              </code>
            </pre>
          )
        }

        // `show === 'code'`
        return (
          <pre>
            <code>
              {toJsxRuntime(starryNight.highlight(String(file), 'source.js'), {
                Fragment,
                jsx,
                jsxs
              })}
            </code>
          </pre>
        )

        function captureMdast() {
          /**
           * @param {MdastRoot} tree
           *   Tree.
           * @returns {undefined}
           *   Nothing.
           */
          return function (tree) {
            const clone = structuredClone(tree)
            if (!positions) cleanUnistTree(clone)
            ast = clone
          }
        }

        function captureHast() {
          /**
           * @param {HastRoot} tree
           *   Tree.
           * @returns {undefined}
           *   Nothing.
           */
          return function (tree) {
            const clone = structuredClone(tree)
            if (!positions) cleanUnistTree(clone)
            ast = clone
          }
        }

        function captureEsast() {
          /**
           * @param {Program} tree
           *   Tree.
           * @returns {undefined}
           *   Nothing.
           */
          return function (tree) {
            const clone = structuredClone(tree)
            if (!positions) visitEstree(clone, removeFromEstree)
            ast = clone
          }
        }
      }
    },
    [
      development,
      directive,
      frontmatter,
      gfm,
      generateJsx,
      formatMarkdown,
      math,
      outputFormatFunctionBody,
      positions,
      raw,
      show,
      value
    ]
  )

  const scope = formatMarkdown ? 'text.md' : 'source.mdx'
  // Cast to actual value.
  const compiledResult = /** @type {EvalResult | undefined} */ (evalResult)
  /** @type {ReactNode | undefined} */
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
      <form>
        <div className="playground-area">
          <div className="playground-inner">
            <div className="playground-draw">
              {toJsxRuntime(starryNight.highlight(value, scope), {
                Fragment,
                jsx,
                jsxs
              })}
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
            <legend>Show</legend>
            <label>
              <select
                name="show"
                onChange={function (event) {
                  setShow(event.target.value)
                }}
              >
                <option value="result">evaluated result</option>
                <option value="code">compiled code</option>
                <option value="mdast">mdast (markdown)</option>
                <option value="hast">hast (html)</option>
                <option value="esast">esast (javascript)</option>
              </select>{' '}
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
            <legend>Input format</legend>
            <label>
              <input
                type="radio"
                name="language"
                checked={!formatMarkdown}
                onChange={function () {
                  setFormatMarkdown(false)
                }}
              />{' '}
              MDX (<code>format: &apos;mdx&apos;</code>)
            </label>
            <label>
              <input
                type="radio"
                name="language"
                checked={formatMarkdown}
                onChange={function () {
                  setFormatMarkdown(true)
                }}
              />{' '}
              markdown (<code>format: &apos;markdown&apos;</code>)
            </label>
          </fieldset>

          <fieldset disabled={show === 'result'}>
            <legend>Output format</legend>
            <label>
              <input
                type="radio"
                name="output-format"
                checked={outputFormatFunctionBody}
                onChange={function () {
                  setOutputFormatFunctionBody(true)
                }}
              />{' '}
              function body (
              <code>outputFormat: &apos;function-body&apos;</code>)
            </label>
            <label>
              <input
                type="radio"
                name="output-format"
                checked={!outputFormatFunctionBody}
                onChange={function () {
                  setOutputFormatFunctionBody(false)
                }}
              />{' '}
              program (<code>outputFormat: &apos;program&apos;</code>)
            </label>
          </fieldset>

          <fieldset disabled={show === 'result'}>
            <legend>Development</legend>
            <label>
              <input
                type="radio"
                name="development"
                checked={development}
                onChange={function () {
                  setDevelopment(true)
                }}
              />{' '}
              generate for development (<code>development: true</code>)
            </label>
            <label>
              <input
                type="radio"
                name="development"
                checked={!development}
                onChange={function () {
                  setDevelopment(false)
                }}
              />{' '}
              generate for production (<code>development: false</code>)
            </label>
          </fieldset>

          <fieldset disabled={show === 'result'}>
            <legend>JSX</legend>
            <label>
              <input
                type="radio"
                name="jsx"
                checked={generateJsx}
                onChange={function () {
                  setGenerateJsx(true)
                }}
              />{' '}
              keep JSX (<code>jsx: true</code>)
            </label>
            <label>
              <input
                type="radio"
                name="jsx"
                checked={!generateJsx}
                onChange={function () {
                  setGenerateJsx(false)
                }}
              />{' '}
              compile JSX away (<code>jsx: false</code>)
            </label>
          </fieldset>

          <fieldset disabled={show === 'result' || show === 'code'}>
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
 * @param {Readonly<FallbackProps>} properties
 *   Properties.
 * @returns {ReactNode}
 *   Element.
 */
function ErrorFallback(properties) {
  // type-coverage:ignore-next-line
  const error = /** @type {Error} */ (properties.error)
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <DisplayError error={error} />
      <button type="button" onClick={properties.resetErrorBoundary}>
        Try again
      </button>
    </div>
  )
}

/**
 * @param {DisplayProperties} properties
 *   Properties.
 * @returns {ReactNode}
 *   Element.
 */
function DisplayError(properties) {
  return (
    <pre>
      <code>
        {String(
          properties.error.stack
            ? properties.error.message + '\n' + properties.error.stack
            : properties.error
        )}
      </code>
    </pre>
  )
}

/**
 * @param {HastRoot | MdastRoot} node
 *   mdast or hast root.
 * @returns {undefined}
 *   Nothing.
 */
function cleanUnistTree(node) {
  removePosition(node, {force: true})
  visit(node, cleanUnistNode)
}

/**
 * @param {HastNodes | MdastNodes | MdxJsxAttribute | MdxJsxAttributeValueExpression | MdxJsxExpressionAttribute} node
 *   Node.
 * @returns {undefined}
 *   Nothing.
 */
function cleanUnistNode(node) {
  if (
    node.type === 'mdxJsxAttribute' &&
    'value' in node &&
    node.value &&
    typeof node.value === 'object'
  ) {
    cleanUnistNode(node.value)
  }

  if (
    'attributes' in node &&
    node.attributes &&
    Array.isArray(node.attributes)
  ) {
    for (const attribute of node.attributes) {
      removePosition(attribute, {force: true})
      cleanUnistNode(attribute)
    }
  }

  if (node.data && 'estree' in node.data && node.data.estree) {
    visitEstree(node.data.estree, removeFromEstree)
  }
}

/**
 * @param {EstreeNode} node
 *   estree node.
 * @returns {undefined}
 *   Nothing.
 */
function removeFromEstree(node) {
  delete node.loc
  delete node.start
  delete node.end
  delete node.range
}
