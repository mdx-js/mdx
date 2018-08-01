import React from 'react'
import { MDXProvider } from '@mdx-js/tag'
import { Container, Provider as RebassProvider } from 'rebass'
import createComponents from '@rebass/markdown'

import Doc from './example.md'

export default () => (
  <MDXProvider components={createComponents()}>
    <RebassProvider>
      <Container>
        <Doc />
      </Container>
    </RebassProvider>
  </MDXProvider>
)
