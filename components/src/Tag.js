import React from 'react'
import PropTypes from 'prop-types'

const defaults = {
  inlineCode: 'code',
  wrapper: 'div'
}

export default () => {
  const {name, props, children, components = {}} = this.props
  const Component = components[name] || defaults[name] || name
  return <Component {...props}>{children}</Component>
}
