const {createContext, h} = require('preact')
const {useContext} = require('preact/hooks')

const isFunction = obj => typeof obj === 'function'

const MDXContext = createContext({})

const withMDXComponents = Component => props => {
  const allComponents = useMDXComponents(props.components)
  return h(Component, {...props, allComponents})
}

const useMDXComponents = components => {
  const contextComponents = useContext(MDXContext)

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

  return h(MDXContext.Provider, {value: allComponents}, children)
}

exports.MDXContext = MDXContext
exports.MDXProvider = MDXProvider
exports.withMDXComponents = withMDXComponents
exports.useMDXComponents = useMDXComponents
