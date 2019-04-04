import React, {useContext} from 'react'
import {LiveProvider, LivePreview, LiveEditor, LiveError} from 'react-live'
import mdx from '@mdx-js/mdx'
import {mdx as createElement} from '@mdx-js/react'
import * as Rebass from '@rebass/emotion'
import {ThemeContext} from '@emotion/core'
import css from '@styled-system/css'

const transformCode = isMDX => src => {
  if (!isMDX) {
    return `<>${src}</>`
  }
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
  scope = defaultScope,
  mdx,
  editable = true,
  className,
  ...props
}) => {
  const theme = useContext(ThemeContext)
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
      transformCode={transformCode(mdx)}
      theme={theme.prism}
    >
      <LivePreview
        css={css({
          p: 3,
          border: '1px solid',
          borderColor: theme.colors.lightgray
        })}
      />
      {editable && (
        <LiveEditor
          className={className}
          padding={16}
          style={{
            fontFamily: '"Roboto Mono", Menlo, monospace',
            fontSize: 14
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
