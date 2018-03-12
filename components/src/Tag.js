import React from 'react'
import PropTypes from 'prop-types'

const defaults = {
  inlineCode: 'code',
  wrapper: 'div'
}

class Tag extends React.Component {
  static contextTypes = {
    components: PropTypes.Object
  }
  render() {
    const {components = {}} = this.context
    const {name, props, children} = this.props
    const Component = components[name] || defaults[name] || name
    return <Component {...props}>{children}</Component>
  }
}

export default Tag
