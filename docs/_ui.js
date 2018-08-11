import React from 'react'
import { Pre, Box, Border } from 'rebass'
import { LiveEditor as Editor, LivePreview } from '@compositor/x0/components'

export const Logo = () => <img src="https://mdx-logo.now.sh" width="70" />

export const LiveEditor = props => {
  const lang = (props.className || '').replace(/^language\-/, '')
  const type = lang.charAt(0)
  const code = React.Children.toArray(props.children).join('\n')

  switch (type) {
    case '.':
      return (
        <Editor
          mdx={lang === '.mdx'}
          code={code}
        />
      )
    case '!':
      return (
        <LivePreview
          mdx={lang === '!mdx'}
          code={code}
        />
      )
    default:
      return (
        <Pre
          p={3}
          mt={4}
          mb={4}
          bg='gray'
          children={props.children}
        />
      )
  }
}
