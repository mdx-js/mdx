import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'

class Provider extends Component {
  getChildContext () {
    return {
      components: this.props.components
    }
  }

  render () {
    return (
      <Fragment>
        {this.props.children}
      </Fragment>
    )
  }
}

Provider.childContextTypes = {
  components: PropTypes.object.isRequired
}

export default Provider
