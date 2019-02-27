import React from 'react'

const isFunction = obj => typeof obj === 'function'

export const MDXContext = React.createContext({})

export const withMDXComponents = Component => props => (
  <MDXContext.Consumer>
    {contextComponents => {
      const allComponents = props.components || contextComponents

      return <Component {...props} components={allComponents} />
    }}
  </MDXContext.Consumer>
)

const MDXProvider = props => (
  <MDXContext.Consumer>
    {outerContextComponents => {
      const allComponents = isFunction(props.components)
        ? props.components(outerContextComponents)
        : props.components

      return (
        <MDXContext.Provider value={allComponents} children={props.children} />
      )
    }}
  </MDXContext.Consumer>
)

export default MDXProvider
