import * as React from 'react'
import {
  MDXProvider,
  useMDXComponents,
  withMDXComponents,
  ComponentsProp,
  MDXContext,
  mdx
} from '@mdx-js/react'

const H1 = ({children}: {children: React.ComponentType}) => <h1>{children}</h1>

const MDXProvideExample = () => (
  <MDXProvider components={{h1: H1}}>
    <h1>Hello, world!</h1>
  </MDXProvider>
)

const WithMDXComponentsExample = () =>
  withMDXComponents(({components}: ComponentsProp) => {
    components // $ExpectType ComponentDictionary
    return <div />
  })

const UseMDXComponentsExample = () => {
  useMDXComponents({h1: H1}) // $ExpectType ComponentDictionary
}

const UseMDXContextExample = () => {
  const {components} = React.useContext(MDXContext)
  components // $ExpectType ComponentDictionary
}

const MDXCreateElementExample = () => mdx('mdx', {title: 'example'}, [])
