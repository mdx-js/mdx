import React from 'react'
import PropTypes from 'prop-types'

const defaults = {
  inlineCode: 'code',
  wrapper: 'div'
}

export default props => {
  const {
    name,
    parentName,
    props: childProps = {},
    children,
    components = {},
    Layout
  } = props
  const Component =
    components[`${parentName}.${name}`] ||
    components[name] ||
    defaults[name] ||
    name

  if(Layout) {
    return <Layout components={components}>
      <Component {...childProps}>{children}</Component>
    </Layout>
  }

  return <Component {...childProps}>{children}</Component>
}
