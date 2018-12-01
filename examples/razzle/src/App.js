import React from 'react'
import {MDXProvider} from '@mdx-js/tag'

import Doc from './example.md'

const components = {
  h1: props => <h1 style={{color: 'tomato'}} {...props} />
}

export default () => (
  <MDXProvider components={components}>
    <Doc />
  </MDXProvider>
)
