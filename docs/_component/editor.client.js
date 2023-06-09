import React, {useState, useMemo, createElement, memo, useCallback} from 'react'
import {useDebounceFn} from 'ahooks'
import * as runtime from 'react/jsx-runtime'
import {VFile} from 'vfile'
import {VFileMessage} from 'vfile-message'
import {statistics} from 'vfile-statistics'
import {reporter} from 'vfile-reporter'
import {evaluate} from '@mdx-js/mdx'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import remarkFrontmatter from 'remark-frontmatter'
import remarkDirective from 'remark-directive'
import remarkMath from 'remark-math'
import {visit as visitEstree} from 'estree-util-visit'
import {removePosition} from 'unist-util-remove-position'
import CodeMirror from 'rodemirror'
import {basicSetup} from 'codemirror'
import {markdown as langMarkdown} from '@codemirror/lang-markdown'
import {oneDark} from '@codemirror/theme-one-dark'
import {Tab, Tabs, TabList, TabPanel} from 'react-tabs'
import {ErrorBoundary} from 'react-error-boundary'
import {toH} from 'hast-to-hyperscript'
import {lowlight} from 'lowlight/lib/core.js'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import markdown from 'highlight.js/lib/languages/markdown'

lowlight.registerLanguage('js', javascript)
lowlight.registerLanguage('json', json)
lowlight.registerLanguage('md', markdown)

function removePositionEsast(tree) {
  visitEstree(tree, remove)
  return tree

  function remove(node) {
    delete node.loc
    delete node.start
    delete node.end
    delete node.range
  }
}

function useMdx(defaults) {
  const [state, setState] = useState({...defaults, file: null})
  const {run: setConfig} = useDebounceFn(
    async (config) => {
      const basename = config.formatMd ? 'example.md' : 'example.mdx'
      const file = new VFile({basename, value: config.value})

      const capture = (name) => () => (tree) => {
        file.data[name] = tree
      }

      const remarkPlugins = []
      if (config.gfm) remarkPlugins.push(remarkGfm)
      if (config.frontmatter) remarkPlugins.push(remarkFrontmatter)
      if (config.math) remarkPlugins.push(remarkMath)
      if (config.directive) remarkPlugins.push(remarkDirective)
      remarkPlugins.push(capture('mdast'))

      const rehypePlugins = []
      if (config.rehypeRaw) rehypePlugins.push(rehypeRaw)
      rehypePlugins.push(capture('hast'))

      try {
        file.result = (
          await evaluate(file, {
            ...runtime,
            useDynamicImport: true,
            remarkPlugins,
            rehypePlugins,
            recmaPlugins: [capture('esast')]
          })
        ).default

        if (!config.position) {
          removePosition(file.data.mdast, {force: true})
          removePosition(file.data.hast, {force: true})
          removePositionEsast(file.data.esast)
        }
      } catch (error) {
        const message =
          error instanceof VFileMessage ? error : new VFileMessage(error)

        if (!file.messages.includes(message)) {
          file.messages.push(message)
        }

        message.fatal = true
      }

      setState({...config, file})
    },
    {leading: true, trailing: true, wait: 500}
  )

  return [state, setConfig]
}

function ErrorFallback({error, resetErrorBoundary}) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button type="button" onClick={resetErrorBoundary}>
        Try again
      </button>
    </div>
  )
}

const MemoizedCodeMirror = memo((props) => (
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <CodeMirror {...props} />
  </ErrorBoundary>
))

function FallbackComponent({error}) {
  const message = new VFileMessage(error)
  message.fatal = true
  return (
    <pre>
      <code>{String(message)}</code>
    </pre>
  )
}

export function Editor({children}) {
  const defaultValue = children
  const extensions = useMemo(() => [basicSetup, oneDark, langMarkdown()], [])
  const [state, setConfig] = useMdx({
    formatMd: false,
    position: false,
    gfm: false,
    frontmatter: false,
    directive: false,
    math: false,
    rehypeRaw: false,
    value: defaultValue
  })
  const onUpdate = useCallback(
    (v) => {
      if (v.docChanged) {
        setConfig({...state, value: String(v.state.doc)})
      }
    },
    [state, setConfig]
  )
  const stats = state.file ? statistics(state.file) : {}

  // Create a preview component that can handle errors with try-catch block; for catching invalid JS expressions errors that ErrorBoundary cannot catch.
  const Preview = useCallback(() => {
    try {
      return state.file.result()
    } catch (error) {
      return <FallbackComponent error={error} />
    }
  }, [state])

  return (
    <div className="playground-editor">
      <Tabs className="frame">
        <TabList className="frame-tab-bar frame-tab-bar-scroll">
          <Tab
            className="frame-tab-item frame-tab-item-dark"
            selectedClassName="frame-tab-item-selected"
          >
            Editor
          </Tab>
          <Tab
            className="frame-tab-item"
            selectedClassName="frame-tab-item-selected"
          >
            Options
          </Tab>
        </TabList>
        <TabPanel>
          <div className="frame-body frame-body-box-fixed-height">
            <noscript>
              <pre>
                <code className="hljs language-md">
                  {toH(createElement, lowlight.highlight('md', defaultValue))}
                </code>
              </pre>
            </noscript>
            <MemoizedCodeMirror
              value={state.value}
              extensions={extensions}
              onUpdate={onUpdate}
            />
          </div>
        </TabPanel>
        <TabPanel>
          <form className="frame-body frame-body-box frame-body-box-fixed-height">
            <fieldset>
              <label>
                <input
                  type="radio"
                  name="language"
                  checked={!state.formatMd}
                  onChange={() => {
                    setConfig({...state, formatMd: false})
                  }}
                />{' '}
                Use <code>MDX</code>
              </label>
              <span style={{margin: '1em'}}>{' | '}</span>
              <label>
                <input
                  type="radio"
                  name="language"
                  checked={state.formatMd}
                  onChange={() => {
                    setConfig({...state, formatMd: true})
                  }}
                />{' '}
                Use <code>CommonMark</code>
              </label>
            </fieldset>
            <label>
              <input
                checked={state.position}
                type="checkbox"
                onChange={() =>
                  setConfig({...state, position: !state.position})
                }
              />{' '}
              Show positional info
            </label>
            <label>
              <input
                checked={state.gfm}
                type="checkbox"
                onChange={() => setConfig({...state, gfm: !state.gfm})}
              />{' '}
              Use{' '}
              <a href="https://github.com/remarkjs/remark-gfm">
                <code>remark-gfm</code>
              </a>
            </label>
            <label>
              <input
                checked={state.frontmatter}
                type="checkbox"
                onChange={() =>
                  setConfig({...state, frontmatter: !state.frontmatter})
                }
              />{' '}
              Use{' '}
              <a href="https://github.com/remarkjs/remark-frontmatter">
                <code>remark-frontmatter</code>
              </a>
            </label>
            <label>
              <input
                checked={state.math}
                type="checkbox"
                onChange={() => setConfig({...state, math: !state.math})}
              />{' '}
              Use{' '}
              <a href="https://github.com/remarkjs/remark-math/tree/main/packages/remark-math">
                <code>remark-math</code>
              </a>
            </label>
            <label>
              <input
                checked={state.directive}
                type="checkbox"
                onChange={() =>
                  setConfig({...state, directive: !state.directive})
                }
              />{' '}
              Use{' '}
              <a href="https://github.com/remarkjs/remark-directive">
                <code>remark-directive</code>
              </a>
            </label>
            <label>
              <input
                checked={state.rehypeRaw}
                type="checkbox"
                onChange={() =>
                  setConfig({...state, rehypeRaw: !state.rehypeRaw})
                }
              />{' '}
              Use{' '}
              <a href="https://github.com/rehypejs/rehype-raw">
                <code>rehype-raw</code>
              </a>
            </label>
          </form>
        </TabPanel>
      </Tabs>

      <Tabs className="frame">
        <TabList className="frame-tab-bar frame-tab-bar-scroll">
          {[
            'Run',
            'Compile',
            'mdast (markdown)',
            'hast (HTML)',
            'esast (JS)'
          ].map((label) => {
            const compile = label === 'Compile'
            const className =
              'frame-tab-item' + (compile ? ' playground-result-badge' : '')
            return (
              <Tab
                key={label}
                data-label={
                  compile
                    ? stats.fatal
                      ? 'danger'
                      : stats.warn
                      ? 'warn'
                      : 'success'
                    : undefined
                }
                data-count={
                  compile ? stats.fatal || stats.warn || 0 : undefined
                }
                className={className}
                selectedClassName="frame-tab-item-selected"
              >
                {label}
              </Tab>
            )
          })}
        </TabList>

        <TabPanel>
          <noscript>Enable JavaScript for the rendered result.</noscript>
          <div className="frame-body frame-body-box-fixed-height frame-body-box">
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              {state.file && state.file.result ? <Preview /> : null}
            </ErrorBoundary>
          </div>
        </TabPanel>
        <TabPanel>
          <div className="frame-body frame-body-box-fixed-height">
            {state.file ? (
              stats.fatal ? (
                <pre>
                  <code>{reporter(state.file)}</code>
                </pre>
              ) : (
                <pre>
                  <code className="hljs language-js">
                    {toH(
                      createElement,
                      lowlight.highlight('js', String(state.file))
                    )}
                  </code>
                </pre>
              )
            ) : null}
          </div>
        </TabPanel>
        <TabPanel>
          <div className="frame-body frame-body-box-fixed-height">
            {state.file && state.file.data.mdast ? (
              <pre>
                <code className="hljs language-js">
                  {toH(
                    createElement,
                    lowlight.highlight(
                      'json',
                      JSON.stringify(state.file.data.mdast, null, 2)
                    )
                  )}
                </code>
              </pre>
            ) : null}
          </div>
        </TabPanel>
        <TabPanel>
          <div className="frame-body frame-body-box-fixed-height">
            {state.file && state.file.data.hast ? (
              <pre>
                <code className="hljs language-js">
                  {toH(
                    createElement,
                    lowlight.highlight(
                      'json',
                      JSON.stringify(state.file.data.hast, null, 2)
                    )
                  )}
                </code>
              </pre>
            ) : null}
          </div>
        </TabPanel>
        <TabPanel>
          <div className="frame-body frame-body-box-fixed-height">
            {state.file && state.file.data.esast ? (
              <pre>
                <code className="hljs language-js">
                  {toH(
                    createElement,
                    lowlight.highlight(
                      'json',
                      JSON.stringify(state.file.data.esast, null, 2)
                    )
                  )}
                </code>
              </pre>
            ) : null}
          </div>
        </TabPanel>
      </Tabs>
    </div>
  )
}
