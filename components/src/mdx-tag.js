import React from 'react'
import PropTypes from 'prop-types'

const defaults = {
  inlineCode: 'code',
  wrapper: 'div'
}

export default (props) => {
  const { name, props: childProps, children, components = {} } = props
  const Component = components[name] || defaults[name] || name
  return <Component {...childProps}>{children}</Component>
}
