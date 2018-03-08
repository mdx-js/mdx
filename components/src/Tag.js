import React from 'react'
import PropTypes from 'prop-types'

class Tag extends React.Component {
  static contextTypes = {
    components: PropTypes.Object
  }
  render() {
    const {components} = this.context
    const {name, props, children} = this.props
    const Component = components[name] || name
    return <Component {...props}>{children}</Component>
  }
}

export default Tag
