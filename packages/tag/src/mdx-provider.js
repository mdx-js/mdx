import React from 'react'
import createReactContext from 'create-react-context'
import PropTypes from 'prop-types'

const { Provider, Consumer } = createReactContext({})

export const withMDXComponents = Component => ({ components, ...props }) => (
  <Consumer>
    {contextComponents => (
      <Component components={components || contextComponents} {...props} />
    )}
  </Consumer>
)

const MDXProvider = ({ components, children }) => (
  <Provider value={components}>{children}</Provider>
)

MDXProvider.propTypes = {
  components: PropTypes.object.isRequired,
  children: PropTypes.element.isRequired
}

export default MDXProvider
