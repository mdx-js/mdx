import React from 'react'
import classnamify from 'classnamify'
import matter from 'gray-matter'

import { ThemeProvider } from 'styled-components'

import {
  LiveProvider,
  LiveEditor,
  LiveError,
  LivePreview
} from 'react-live'

const transformCode = (code, theme, lang = 'jsx') => `
  <ThemeProvider theme={${JSON.stringify(theme)}}>
    <div>
    ${lang === 'html' ? classnamify(code) : code}
    </div>
  </ThemeProvider>
`

export default ({
  components,
  scope,
  theme,
  code,
  className,
  ...props
})  => {
  const fullScope = Object.assign({}, components, scope, {
    ThemeProvider,
    theme
  })

  const lang = (className[0] || '').split(/-\./)[1] || 'jsx'
  const parsedCode = matter(code)

  return (
    <LiveProvider
      code={parsedCode.content}
      scope={fullScope}
      mountStylesheet={false}
      transformCode={newCode => transformCode(newCode, theme, lang)}
      {...props}
    >
      <LivePreview />
      {parsedCode.data.liveEditor ? <LiveEditor /> : null}
      <LiveError />
    </LiveProvider>
  )
}
