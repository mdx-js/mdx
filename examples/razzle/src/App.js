import React from 'react'
import Doc from './example.md'

export default () => (
  <Doc
    components={{
      h1: props => <h1 style={{ color: 'tomato' }} {...props} />
    }}
  />
)
