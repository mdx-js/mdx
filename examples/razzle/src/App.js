import React from 'react'
import {MDXProvider} from '@mdx-js/react'

import Doc from './example.mdx'

const components = {
  h1: props => <h1 style={{color: 'tomato'}} {...props} />
}

export default () => (
  <MDXProvider components={components}>
    <Doc />
  </MDXProvider>
)
