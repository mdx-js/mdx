import React from 'react'

const {Provider, Consumer} = React.createContext({})

export const withMDXComponents = Component => props => (
  <Consumer>
    {contextComponents => (
      <Component
        {...props}
        components={props.components || contextComponents}
      />
    )}
  </Consumer>
)

const MDXProvider = props => (
  <Provider value={props.components}>{props.children}</Provider>
)

export default MDXProvider
