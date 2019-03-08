import React from 'react'
import {Pre} from 'rebass'
import {LiveEditor as Editor, LivePreview} from '@compositor/x0/components'

export const Logo = () => (
  <div>
    <img src="https://mdx-logo.now.sh" width="70" alt="MDX logo" />

    <a
      style={{
        position: 'absolute',
        right: 11,
        top: 13
      }}
      href="https://github.com/mdx-js/mdx"
    >
      <img
        src="https://icon.now.sh/github/0067ee"
        alt="github logo"
        width="20"
      />
    </a>
  </div>
)

export const LiveEditor = props => {
  const lang = (props.className || '').replace(/^language-/, '')
  const type = lang.charAt(0)
  const code = React.Children.toArray(props.children).join('\n')

  switch (type) {
    case '.':
      return <Editor mdx={lang === '.mdx'} code={code} />
    case '!':
      return <LivePreview mdx={lang === '!mdx'} code={code} />
    default:
      return <Pre p={3} mt={4} mb={4} bg="gray" children={props.children} />
  }
}
