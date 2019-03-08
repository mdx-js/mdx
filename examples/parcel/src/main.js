import React from 'react'
import {render} from 'react-dom'
import {MDXProvider} from '@mdx-js/tag'

import Content from './content.mdx'

const components = {
  h1: props => <h1 style={{color: 'tomato'}} {...props} />
}

render(
  <MDXProvider components={components}>
    <Content />
  </MDXProvider>,
  document.querySelector('#demo')
)
