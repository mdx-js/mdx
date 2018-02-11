import React from 'react'
import { render } from 'react-dom'

import Document from '../md/markdown.md'

const H1 = props => <h1 style={{ color: 'tomato' }} {...props} />
const Box = props => <div style={{ border: 'thin solid purple' }} {...props} />

export default () =>
  <Document
    components={{
      h1: H1,
      Foo: H1,
      Box
    }}
  />
