import React from 'react'
import mdx from 'c8r/mdx'
import PropTypes from 'prop-types'

const Markdown = ({
  text = '',
  components = {},
  ...options
}, context) => {
  const contextComponents = context.components || {}
  const allComponents = Object.assign({}, components, contextComponents)

  return mdx(text, {
    components: allComponents,
    ...options
  })
}

Markdown.contextTypes = {
  components: PropTypes.object
}

export default Markdown
