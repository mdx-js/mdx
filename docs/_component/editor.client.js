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

function useXdm() {
  const [file, setFile] = useState(null)

  const setValue = useCallback(async value => {
    const file = new VFile({basename: 'example.mdx', value})

    const capture = name => () => tree => {
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

export function Editor({children}) {
  const defaultValue = children
  const extensions = useMemo(() => [basicSetup, oneDark, langMarkdown()], [])
  const [file, setValue] = useXdm()
  const stats = file ? statistics(file) : {}

  return (
    <div className="editor">
      <div className="editor-input">
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
          onUpdate={v => {
            if (v.docChanged) {
              setValue(v.state.doc.toString())
            }
          }}
        />
      </div>
      <Tabs className="editor-result">
        <div className="editor-result-tabs">
          <TabList className="editor-result-tabs-scroll">
            {[
              'Run',
              'Compile',
              'mdast (markdown)',
              'hast (HTML)',
              'esast (JS)'
            ].map(label => {
              const compile = label === 'Compile'
              const className =
                'editor-result-tab' + (compile ? ' editor-result-badge' : '')
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
                  selectedClassName="editor-result-tab-selected"
                >
                  {label}
                </Tab>
              )
            })}
          </TabList>
        </div>

        <TabPanel>
          <div className="editor-result-pane">
            <noscript>Enable JavaScript to see the rendered result.</noscript>
            {file && file.result ? (
              <ErrorBoundary FallbackComponent={FallbackComponent}>
                <file.result />
              </ErrorBoundary>
            ) : null}
          </div>
        </TabPanel>
        <TabPanel>
          <div className="editor-result-raw">
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
          <div className="editor-result-raw">
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
          <div className="editor-result-raw">
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
          <div className="editor-result-raw">
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

  function FallbackComponent({error}) {
    const message = new VFileMessage(error)
    message.fatal = true
    return (
      <pre>
        <code>{String(message)}</code>
      </pre>
    )
  }
}
