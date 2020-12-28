import React from 'react'
import {MDXProvider} from '@mdx-js/react'

const components = {
  h1: props => <h1 style={{color: 'tomato'}} {...props} />
}

const Page = ({Component}) => (
  <MDXProvider components={components}>
    <Component />
  </MDXProvider>
)

export default Page
