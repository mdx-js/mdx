import React from 'react'
import CodePreview from './code-preview'
import CodeBlock from './code-block'
import Link from './link'

const heading = Tag => props => (
  <Tag {...props}>
    <a href={'#' + props.id}>{props.children}</a>
  </Tag>
)

export const code = props => {
  const lang = (props.className || '').split(' ')[0].replace(/^language-/, '')
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
  pre: props => props.children,
  a: Link,
  h1: heading('h1'),
  h2: heading('h2'),
  h3: heading('h3'),
  h4: heading('h4'),
  h5: heading('h5'),
  h6: heading('h6')
}
