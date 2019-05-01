import React, {useContext} from 'react'
import {ThemeContext} from '@emotion/core'
import Highlight, {defaultProps} from 'prism-react-renderer'

export default ({children, language, className: outerClassName}) => {
  const theme = useContext(ThemeContext)
  return (
    <Highlight
      {...defaultProps}
      theme={theme.prism}
      code={children.trim()}
      language={language}
    >
      {({className, style, tokens, getLineProps, getTokenProps}) => (
        <pre
          className={[outerClassName, className].join(' ')}
          style={{
            ...style,
            padding: 16,
            overflowX: 'auto'
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
}
