import React from 'react'

const MDXContext = React.createContext({})

export const withMDXComponents = Component => props => {
  const contextComponents = React.useContext(MDXContext)

  return (
    <Component {...props} components={props.components || contextComponents} />
  )
}

export const MDXProvider = props => (
  <MDXContext.Provider value={props.components}>
    {props.children}
  </MDXContext.Provider>
)

export default MDXContext
