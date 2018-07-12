import React from 'react'
import { render } from 'react-dom'

import Content from './content.mdx'

render(
  <div>
    <p>There should be mdx content below:</p>
    <Content />
  </div>,
  document.querySelector('#demo')
)
