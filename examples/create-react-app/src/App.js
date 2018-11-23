import React, {Component} from 'react'
import {MDXProvider} from '@mdx-js/tag'

import Hello from './hello.md'

const components = {
  h1: props => <h1 style={{color: 'tomato'}} {...props} />
}

class App extends Component {
  render() {
    return (
      <MDXProvider components={components}>
        <Hello />
      </MDXProvider>
    )
  }
}

export default App
