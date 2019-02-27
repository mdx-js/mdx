import React from 'react'

const isFunction = obj => typeof obj === 'function'

const MDXContext = React.createContext({})

export const withMDXComponents = Component => props => {
  const contextComponents = React.useContext(MDXContext)
  const allComponents = props.components || contextComponents

  return <Component {...props} components={allComponents} />
}

export const MDXProvider = props => {
  const outerContextComponents = React.useContext(MDXContext)
  const allComponents = isFunction(props.components)
    ? props.components(outerContextComponents)
    : props.components

  return (
    <MDXContext.Provider value={allComponents}>
      {props.children}
    </MDXContext.Provider>
  )
}

export default MDXContext
