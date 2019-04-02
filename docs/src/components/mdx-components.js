import React from 'react'
import CodePreview from './code-preview'
import CodeBlock from './code-block'

export const code = props => {
  const lang = (props.className || '').replace(/^language-/, '')
  const type = lang.charAt(0)
  const code = React.Children.toArray(props.children).join('\n')

  switch (type) {
    case '.':
      return <CodePreview mdx={lang === '.mdx'} code={code} />
    case '!':
      return <CodePreview editable={false} mdx={lang === '!mdx'} code={code} />
    default:
      return <CodeBlock {...props} language={lang} />
  }
}

export default {
  // Prevent page props from being passed to MDX wrapper
  wrapper: props => <>{props.children}</>,
  code,
  pre: props => props.children
}
