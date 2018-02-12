import React from 'react'
import PropTypes from 'prop-types'

import { md } from './'

const Markdown = ({
  text = '',
  components = {},
  ...options
}, context) => {
  const contextComponents = context.components || {}
  const allComponents = Object.assign({}, components, contextComponents)

  const Document = md(text, {
    components: allComponents,
    ...options
  })

  return <Document />
}

Markdown.contextTypes = {
  components: PropTypes.object
}

export default Markdown
