import React from 'react'
import {LiveProvider, LivePreview, LiveEditor, LiveError} from 'react-live'
import mdx from '@mdx-js/mdx'
import * as Rebass from '@rebass/emotion'
import css from '@styled-system/css'
import theme from './theme'
import {prismTheme} from './code-block'

const transformCode = isMDX =>
  isMDX ? src => mdx.sync(src, {skipExport: true}) : src => `<>${src}</>`

const defaultScope = {
  ...Rebass
}

export default ({
  code,
  scope = defaultScope,
  mdx,
  editable = true,
  ...props
}) => {
  return (
    <LiveProvider
      {...props}
      code={code}
      scope={scope}
      transformCode={transformCode(mdx)}
      theme={prismTheme}
    >
      <LivePreview
        css={css({
          p: 3,
          border: `1px solid ${theme.colors.lightgray}`
        })}
      />
      {editable && (
        <LiveEditor
          style={{
            fontFamily: '"Roboto Mono", Menlo, monospace',
            padding: 16,
            fontSize: 14,
            tabSize: 2,
            whiteSpace: 'pre'
          }}
          css={css({
            bg: 'lightgray'
          })}
        />
      )}
      <LiveError
        css={css({
          fontFamily: 'monospace',
          fontSize: 1,
          p: 2,
          color: 'red'
        })}
      />
    </LiveProvider>
  )
}
