import React, {lazy, Component, Suspense} from 'react'
import {importMDX} from 'mdx.macro'

const Content = lazy(() => importMDX('./Content.mdx'))

class App extends Component {
  render() {
    return (
      <div>
        <Suspense fallback={<div>Loading...</div>}>
          <Content />
        </Suspense>
      </div>
    )
  }
}

export default App
