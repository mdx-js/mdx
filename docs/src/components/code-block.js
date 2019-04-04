import React from 'react'
import Highlight, {defaultProps} from 'prism-react-renderer'
import theme from './theme'

export const prismTheme = {
  plain: {
    color: '#282a2e',
    backgroundColor: theme.colors.lightgray
  },
  styles: [
    {
      types: ['comment'],
      style: {
        color: '#666'
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

export default ({children, language, className: outerClassName}) => (
  <Highlight
    {...defaultProps}
    theme={prismTheme}
    code={children.trim()}
    language={language}
  >
    {({className, style, tokens, getLineProps, getTokenProps}) => (
      <pre
        className={[outerClassName, className].join(' ')}
        style={{
          ...style,
          padding: 16
        }}
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
