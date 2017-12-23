import React from 'react'

import { LiveProvider } from 'react-live'
import { ThemeProvider } from 'glamorous'

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
    />
  )
}
