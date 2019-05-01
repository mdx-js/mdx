import React, {useContext, useState} from 'react'
import {LiveProvider, LivePreview, LiveEditor, LiveError} from 'react-live'
import mdx from '@mdx-js/mdx'
import {mdx as createElement} from '@mdx-js/react'
import * as Rebass from '@rebass/emotion'
import {ThemeContext} from '@emotion/core'
import css from '@styled-system/css'

import CodeBlock from './code-block'

const transformCode = src => {
  const transpiledMDX = mdx.sync(src, {skipExport: true})

  return `
    ${transpiledMDX}

    render(
      <MDXContent components={components} {...props} />
    )
  `
}

const defaultScope = {
  ...Rebass
}

export default ({
  code,
  onChange = () => {},
  scope = defaultScope,
  ...props
}) => {
  const theme = useContext(ThemeContext)
  const [activePane, setActivePane] = useState(null)
  const paneWidth = activePane ? '10%' : '30%'

  let mdast
  let hast = {}
  const jsx = mdx.sync(code, {
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

  return (
    <LiveProvider
      {...props}
      code={code}
      scope={{
        components: {},
        props: {},
        ...scope,
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
            borderColor: theme.colors.lightgray,
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

      <div css={{display: 'flex', justifyContent: 'space-between'}}>
        <div
          onClick={() => setActivePane('jsx')}
          css={{
            width: activePane === 'jsx' ? '100%' : paneWidth,
            overflowX: 'auto'
          }}
        >
          <h5>JSX</h5>
          <CodeBlock css={{boxShadow: 'inset 1px 2px 5px rgba(0, 0, 0, .05)'}}>
            {jsx}
          </CodeBlock>
        </div>
        <div
          onClick={() => setActivePane('mdast')}
          css={{
            width: activePane === 'mdast' ? '100%' : paneWidth,
            overflowX: 'auto'
          }}
        >
          <h5>MDAST</h5>
          <CodeBlock css={{boxShadow: 'inset 1px 2px 5px rgba(0, 0, 0, .05)'}}>
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
          <CodeBlock css={{boxShadow: 'inset 1px 2px 5px rgba(0, 0, 0, .05)'}}>
            {JSON.stringify(hast, null, 2)}
          </CodeBlock>
        </div>
      </div>
    </LiveProvider>
  )
}
