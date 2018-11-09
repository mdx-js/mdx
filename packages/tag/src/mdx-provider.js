import React from 'react'

const {Provider, Consumer} = React.createContext({})

export const withMDXComponents = Component => ({components, ...props}) => (
  <Consumer>
    {contextComponents => (
      <Component components={components || contextComponents} {...props} />
    )}
  </Consumer>
)

const MDXProvider = ({components, children}) => (
  <Provider value={components}>{children}</Provider>
)

export default MDXProvider
