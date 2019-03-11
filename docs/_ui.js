/* global window */
import React, {Component} from 'react'
import Highlight, {defaultProps} from 'prism-react-renderer'
import {LiveEditor as Editor, LivePreview} from '@compositor/x0/components'

const prismTheme = {
  plain: {
    color: '#282a2e',
    backgroundColor: '#fafafa'
  },
  styles: [
    {
      types: ['comment'],
      style: {
        color: 'rgb(197, 200, 198)'
      }
    },
    {
      types: ['string', 'number', 'builtin', 'variable'],
      style: {
        color: '#444'
      }
    },
    {
      types: ['class-name', 'function', 'tag', 'attr-name'],
      style: {
        color: 'rgb(40, 42, 46)'
      }
    }
  ]
}

const CodeBlock = ({children, language}) => (
  <Highlight
    {...defaultProps}
    theme={prismTheme}
    code={children}
    language={language}
  >
    {({className, style, tokens, getLineProps, getTokenProps}) => (
      <pre
        className={className}
        style={{...style, marginBottom: '30px', padding: '20px 20px 10px 20px'}}
      >
        {tokens.map((line, i) => (
          <div key={i} {...getLineProps({line, key: i})}>
            {line.map((token, key) => (
              <span key={key} {...getTokenProps({token, key})} />
            ))}
          </div>
        ))}
      </pre>
    )}
  </Highlight>
)

export class Redirect extends Component {
  componentDidMount() {
    const {to} = this.props
    window.location = to
  }

  render() {
    return <h1>Redirecting...</h1>
  }
}

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
      return <CodeBlock {...props} language={lang} />
  }
}
