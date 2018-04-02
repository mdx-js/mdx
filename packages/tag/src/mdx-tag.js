import React from 'react'
import PropTypes from 'prop-types'

const defaults = {
  inlineCode: 'code',
  wrapper: 'div'
}

export default (props) => {
  const { name, parentName, props: childProps = {}, children, components = {} } = props
  const Component = components[name] || components[`${parentName}.${name}}`] || defaults[name] || name
  return <Component {...childProps}>{children}</Component>
}
