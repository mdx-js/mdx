import React from 'react'
import { MDXProvider } from '@mdx-js/tag'
import { Provider as RebassProvider } from 'rebass'
import createComponents from '@rebass/markdown'

export default ({ Component, pageProps }) => (
  <MDXProvider components={createComponents()}>
    <RebassProvider>
      <Component {...pageProps} />
    </RebassProvider>
  </MDXProvider>
)
