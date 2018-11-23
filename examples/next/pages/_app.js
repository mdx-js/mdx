import React from 'react'
import {MDXProvider} from '@mdx-js/tag'
import {createGlobalStyle} from 'styled-components'
import {Provider, baseStyles, mdComponents} from 'unified-ui'

// eslint-disable-next-line no-unused-expressions
createGlobalStyle`
  ${baseStyles}
`

export default ({Component, pageProps}) => (
  <MDXProvider components={mdComponents}>
    <Provider>
      <Component {...pageProps} />
    </Provider>
  </MDXProvider>
)
