import React from 'react'
import Highlight, {defaultProps} from 'prism-react-renderer'

export const prismTheme = {
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

export default ({children, language}) => (
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
