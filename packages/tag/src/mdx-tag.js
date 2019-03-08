import React from 'react'
import {useMDXComponents} from './mdx-context'

const defaults = {
  inlineCode: 'code',
  wrapper: 'div'
}

const MDXTag = ({
  name,
  parentName,
  props: childProps = {},
  children,
  components: propComponents,
  Layout,
  layoutProps
}) => {
  const components = useMDXComponents(propComponents)
  const Component =
    components[`${parentName}.${name}`] ||
    components[name] ||
    defaults[name] ||
    name

  if (Layout) {
    return (
      <Layout components={components} {...layoutProps}>
        <Component {...childProps}>{children}</Component>
      </Layout>
    )
  }

  return <Component {...childProps}>{children}</Component>
}

export default MDXTag
