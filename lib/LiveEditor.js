import React from 'react'

import { ThemeProvider } from 'glamorous'

import {
  LiveProvider,
  LiveEditor,
  LiveError,
  LivePreview
} from 'react-live'

const transformCode = (code, theme) => `
  <ThemeProvider theme={${JSON.stringify(theme)}}>
    <div>
    ${code}
    </div>
  </ThemeProvider>
`

export default ({
  components,
  theme,
  code,
  ...props
})  => {
  const scope = Object.assign({}, components, {
    ThemeProvider,
    theme
  })

  return (
    <LiveProvider
      code={code}
      scope={scope}
      transformCode={newCode => transformCode(newCode, theme)}
      {...props}
    >
      <LivePreview />
      <LiveEditor />
      <LiveError />
    </LiveProvider>
  )
}
