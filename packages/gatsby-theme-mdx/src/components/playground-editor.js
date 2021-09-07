import React, {useContext, useState} from 'react'
import {LiveProvider, LivePreview, LiveEditor, LiveError} from 'react-live'
import mdx from '@mdx-js/mdx'
import {MDXProvider, mdx as createElement} from '@mdx-js/react'
import * as Rebass from '@rebass/emotion'
import {ThemeContext} from '@emotion/react'
import {css} from 'theme-ui'
import remove from 'unist-util-remove'

import CodeBlock from './code-block'

const removeEsm = () => tree => remove(tree, 'mdxjsEsm')

const transformCode = src => {
  let transpiledMDX = ''

  try {
    transpiledMDX = mdx.sync(src, {
      skipExport: true,
      remarkPlugins: [removeEsm]
    })
  } catch (_e) {
    return ''
  }

  return `
    ${transpiledMDX}

    render(
      <MDXProvider components={components}>
        <MDXContent {...props} />
      </MDXProvider>
    )
  `
}

const getOutputs = src => {
  let jsx = ''
  let mdast = {}
  let hast = {}

  try {
    jsx = mdx.sync(src, {
      skipExport: true,
      remarkPlugins: [
        () => ast => {
          mdast = ast
          return ast
        }
      ],
      rehypePlugins: [
        () => ast => {
          hast = ast
          return ast
        }
      ]
    })
  } catch (error) {
    return {error}
  }

  return {jsx, mdast, hast}
}

const defaultScope = {
  MDXProvider,
  ...Rebass
}

export default ({code, onChange = () => {}, scope = {}, ...props}) => {
  const theme = useContext(ThemeContext)
  const [activePane, setActivePane] = useState('jsx')
  const paneWidth = activePane ? '10%' : '30%'

  const {jsx, mdast, hast, error} = getOutputs(code)

  const fullScope = {...defaultScope, ...scope}

  return (
    <LiveProvider
      {...props}
      code={code}
      scope={{
        ...fullScope,
        components: fullScope,
        MDXProvider,
        props: {},
        mdx: createElement
      }}
      noInline={true}
      transformCode={code => {
        onChange(code)

        return transformCode(code)
      }}
      theme={theme.prism}
    >
      <div css={{display: 'flex'}}>
        <LiveEditor
          padding={16}
          style={{
            fontFamily: '"Roboto Mono", Menlo, monospace',
            fontSize: 14,
            minHeight: 400
          }}
          css={css({
            bg: 'lightgray',
            width: '50%'
          })}
        />
        <LivePreview
          css={css({
            p: 3,
            border: '1px solid',
            borderColor: '#f6f6f6',
            width: '50%'
          })}
        />
      </div>
      <LiveError
        css={css({
          fontFamily: 'monospace',
          fontSize: 1,
          p: 2,
          color: 'red'
        })}
      />

      {error ? (
        <>
          <h5>Error</h5>
          <CodeBlock css={{boxShadow: 'inset 1px 2px 5px rgba(0, 0, 0, .05)'}}>
            {error.toString()}
          </CodeBlock>
        </>
      ) : (
        <div css={{display: 'flex', justifyContent: 'space-between'}}>
          <div
            onClick={() => setActivePane('mdast')}
            css={{
              width: activePane === 'mdast' ? '100%' : paneWidth,
              overflowX: 'auto'
            }}
          >
            <h5>MDAST</h5>
            <CodeBlock
              css={{boxShadow: 'inset 1px 2px 5px rgba(0, 0, 0, .05)'}}
            >
              {JSON.stringify(mdast, null, 2)}
            </CodeBlock>
          </div>
          <div
            onClick={() => setActivePane('hast')}
            css={{
              width: activePane === 'hast' ? '100%' : paneWidth,
              overflowX: 'auto'
            }}
          >
            <h5>HAST</h5>
            <CodeBlock
              css={{boxShadow: 'inset 1px 2px 5px rgba(0, 0, 0, .05)'}}
            >
              {JSON.stringify(hast, null, 2)}
            </CodeBlock>
          </div>
          <div
            onClick={() => setActivePane('jsx')}
            css={{
              width: activePane === 'jsx' ? '100%' : paneWidth,
              overflowX: 'auto'
            }}
          >
            <h5>JSX</h5>
            <CodeBlock
              css={{boxShadow: 'inset 1px 2px 5px rgba(0, 0, 0, .05)'}}
            >
              {jsx}
            </CodeBlock>
          </div>
        </div>
      )}
    </LiveProvider>
  )
}
