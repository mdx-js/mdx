import React from 'react'
import {MDXProvider} from '@mdx-js/react'
import {CodeBlock} from './components/CodeBlock.js'

const components = {
  h1: props => <h1 style={{color: 'tomato'}} {...props} />,
  pre: props => <div {...props} />,
  code: CodeBlock
}

const Page = props => {
  const {Component} = props

  return (
    <MDXProvider components={components}>
      <Component />
    </MDXProvider>
  )
}

export default Page
