import React, { Component } from 'react'
import { MDXProvider } from '@mdx-js/tag'
import { Container, Provider as RebassProvider } from 'rebass'
import createComponents from '@rebass/markdown'

import Hello from './hello.md'

class App extends Component {
  render() {
    return (
      <MDXProvider components={createComponents()}>
        <RebassProvider>
          <Container>
            <Hello />
          </Container>
        </RebassProvider>
      </MDXProvider>
    )
  }
}

export default App
