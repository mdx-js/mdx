import React, {useState, useMemo, useCallback, createElement} from 'react'
import * as runtime from 'react/jsx-runtime.js'
import {VFile} from 'vfile'
import {VFileMessage} from 'vfile-message'
import {statistics} from 'vfile-statistics'
import {reporter} from 'vfile-reporter'
import {evaluate} from '@mdx-js/mdx'
import CodeMirror from 'rodemirror'
import {basicSetup} from '@codemirror/basic-setup'
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

function useMdx() {
  const [file, setFile] = useState(null)

  const setValue = useCallback(async (value) => {
    const file = new VFile({basename: 'example.mdx', value})

    const capture = (name) => () => (tree) => {
      file.data[name] = tree
    }

    try {
      file.result = (
        await evaluate(file, {
          ...runtime,
          remarkPlugins: [capture('mdast')],
          rehypePlugins: [capture('hast')],
          recmaPlugins: [capture('esast')]
        })
      ).default
    } catch (error) {
      const message =
        error instanceof VFileMessage ? error : new VFileMessage(error)

      if (!file.messages.includes(message)) {
        file.messages.push(message)
      }

      message.fatal = true
    }

    setFile(file)
  }, [])

  return [file, setValue]
}

export const Editor = ({children}) => {
  const defaultValue = children
  const extensions = useMemo(() => [basicSetup, oneDark, langMarkdown()], [])
  const [file, setValue] = useMdx()
  const stats = file ? statistics(file) : {}

  const FallbackComponent = ({error}) => {
    const message = new VFileMessage(error)
    message.fatal = true
    return (
      <pre>
        <code>{String(message)}</code>
      </pre>
    )
  }

  return (
    <div>
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
            <CodeMirror
              value={defaultValue}
              extensions={extensions}
              onUpdate={(v) => {
                if (v.docChanged) {
                  setValue(v.state.doc.toString())
                }
              }}
            />
          </div>
        </TabPanel>
        <TabPanel>
          <div className="frame-body frame-body-box frame-body-box-fixed-height">
            Settings Lorem ipsum dolor sit amet, consectetur adipisicing elit,
            sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
            nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </div>
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
          <noscript>Enable JavaScript to see the rendered result.</noscript>
          <div className="frame-body frame-body-box-fixed-height frame-body-box">
            {file && file.result ? (
              <ErrorBoundary FallbackComponent={FallbackComponent}>
                <file.result />
              </ErrorBoundary>
            ) : null}
          </div>
        </TabPanel>
        <TabPanel>
          <div className="frame-body frame-body-box-fixed-height">
            {file ? (
              stats.fatal ? (
                <pre>
                  <code>{reporter(file)}</code>
                </pre>
              ) : (
                <pre>
                  <code className="hljs language-js">
                    {toH(createElement, lowlight.highlight('js', String(file)))}
                  </code>
                </pre>
              )
            ) : null}
          </div>
        </TabPanel>
        <TabPanel>
          <div className="frame-body frame-body-box-fixed-height">
            {file && file.data.mdast ? (
              <pre>
                <code className="hljs language-js">
                  {toH(
                    createElement,
                    lowlight.highlight(
                      'json',
                      JSON.stringify(file.data.mdast, null, 2)
                    )
                  )}
                </code>
              </pre>
            ) : null}
          </div>
        </TabPanel>
        <TabPanel>
          <div className="frame-body frame-body-box-fixed-height">
            {file && file.data.hast ? (
              <pre>
                <code className="hljs language-js">
                  {toH(
                    createElement,
                    lowlight.highlight(
                      'json',
                      JSON.stringify(file.data.hast, null, 2)
                    )
                  )}
                </code>
              </pre>
            ) : null}
          </div>
        </TabPanel>
        <TabPanel>
          <div className="frame-body frame-body-box-fixed-height">
            {file && file.data.esast ? (
              <pre>
                <code className="hljs language-js">
                  {toH(
                    createElement,
                    lowlight.highlight(
                      'json',
                      JSON.stringify(file.data.esast, null, 2)
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
