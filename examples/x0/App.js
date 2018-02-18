import React from 'react'

import { ComponentsProvider } from '@compositor/markdown'

import Doc from './readme.md'

export default () =>
  <ComponentsProvider
    components={{
      h1: props => <h1 style={{ color: 'tomato'}} {...props} />
    }}
  >
    <Doc />
  </ComponentsProvider>
