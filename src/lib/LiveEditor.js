import React from 'react'
import classnamify from 'classnamify'

import { ThemeProvider } from 'glamorous'

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
  theme,
  code,
  className,
  ...props
})  => {
  const scope = Object.assign({}, components, {
    ThemeProvider,
    theme
  })

  const lang = (className[0] || '').split(/-\./)[1] || 'jsx'

  return (
    <LiveProvider
      code={code}
      scope={scope}
      transformCode={newCode => transformCode(newCode, theme, lang)}
      {...props}
    >
      <LivePreview />
      <LiveEditor />
      <LiveError />
    </LiveProvider>
  )
}
