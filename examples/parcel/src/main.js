import React from 'react'
import { render } from 'react-dom'
import { MDXProvider } from '@mdx-js/tag'
import { Provider as RebassProvider } from 'rebass'
import createComponents from '@rebass/markdown'

import Content from './content.mdx'

render(
  <MDXProvider components={createComponents()}>
    <RebassProvider>
      <Content />
    </RebassProvider>
  </MDXProvider>,
  document.querySelector('#demo')
)
