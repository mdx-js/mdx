import React from 'react'
import Document from '../md/markdown.md'

const H1 = props => <h1 style={{ color: 'tomato' }} {...props} />

export default () => (
  <Document components={{ h1: H1 }} />
)
