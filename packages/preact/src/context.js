/* @jsx h */
// eslint-disable-next-line
import { createContext, h } from "preact";
import {useContext} from 'preact/hooks'

const isFunction = obj => typeof obj === 'function'

const MDXContext = createContext({})

export const withMDXComponents = Component => props => {
  const allComponents = useMDXComponents(props.components)
  return <Component {...props} components={allComponents} />
}

export const useMDXComponents = components => {
  const contextComponents = useContext(MDXContext)
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
