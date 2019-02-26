import React from 'react'
import {MDXProvider} from '@mdx-js/tag'

const components = {
  h1: props => <h5 {...props} />,
  aside: props => <pre {...props} />
}

export const wrapRootElement = ({element}) => {
  return <MDXProvider components={components}>{element}</MDXProvider>
}
