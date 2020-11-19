/* @jsx h */
import {createContext, h} from 'preact'
import {useContext} from 'preact/hooks'

const isFunction = obj => typeof obj === 'function'

const MDXContext = createContext({})

export const withMDXComponents = Component => props => {
  const allComponents = useMDXComponents(props.components)
  return <Component {...props} components={allComponents} />
}

export const useMDXComponents = components => {
  const contextComponents = useContext(MDXContext)

  // Custom merge via a function prop
  if (isFunction(components)) {
    return components(contextComponents)
  }

  return {...contextComponents, ...components}
}

export const MDXProvider = ({components, children, disableParentContext}) => {
  let allComponents = useMDXComponents(components)

  if (disableParentContext) {
    allComponents = components
  }

  return (
    <MDXContext.Provider value={allComponents}>{children}</MDXContext.Provider>
  )
}

export default MDXContext
