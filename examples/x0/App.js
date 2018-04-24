import React from 'react'

import Doc from './readme.md'

export default () => (
  <Doc
    components={{
      h1: props => <h1 style={{ color: 'tomato' }} {...props} />
    }}
  />
)
