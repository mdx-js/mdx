import React from 'react'
import { MDXProvider } from '@mdx-js/tag'
import { Provider as RebassProvider } from 'rebass'

import components from '../components/markdown'

export default ({ Component, pageProps }) => (
  <MDXProvider components={components}>
    <RebassProvider>
      <Component {...pageProps} />
    </RebassProvider>
  </MDXProvider>
)
