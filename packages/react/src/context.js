const React = require('react')

const isFunction = obj => typeof obj === 'function'

const MDXContext = React.createContext({})

const withMDXComponents = Component => props => {
  const allComponents = useMDXComponents(props.components)
  return React.createElement(Component, {...props, allComponents})
}

const useMDXComponents = components => {
  const contextComponents = React.useContext(MDXContext)

  // Custom merge via a function prop
  if (isFunction(components)) {
    return components(contextComponents)
  }

  return {...contextComponents, ...components}
}

const MDXProvider = ({components, children, disableParentContext}) => {
  let allComponents = useMDXComponents(components)

  if (disableParentContext) {
    allComponents = components
  }

  return React.createElement(
    MDXContext.Provider,
    {value: allComponents},
    children
  )
}

exports.withMDXComponents = withMDXComponents
exports.useMDXComponents = useMDXComponents
exports.MDXProvider = MDXProvider
exports.MDXContext = MDXContext
