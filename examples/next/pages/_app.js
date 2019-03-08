import React from 'react'
import {MDXProvider} from '@mdx-js/tag'
import {Provider, mdComponents} from 'unified-ui'

export default ({Component, pageProps}) => (
  <MDXProvider components={mdComponents}>
    <Provider>
      <Component {...pageProps} />
    </Provider>
  </MDXProvider>
)
