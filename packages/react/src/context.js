import React from 'react'

const isFunction = obj => typeof obj === 'function'

const MDXContext = React.createContext({})

export const withMDXComponents = Component => props => {
  const allComponents = useMDXComponents(props.components)

  return <Component {...props} components={allComponents} />
}

export const useMDXComponents = components => {
  const contextComponents = React.useContext(MDXContext)
  let allComponents = contextComponents
  if (components) {
    allComponents = isFunction(components)
      ? components(contextComponents)
      : {...contextComponents, ...components}
  }

  return allComponents
}

export const MDXProvider = props => {
  const allComponents = useMDXComponents(props.components)

  return (
    <MDXContext.Provider value={allComponents}>
      {props.children}
    </MDXContext.Provider>
  )
}

export default MDXContext
