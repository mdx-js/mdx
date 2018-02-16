import React from 'react'
import mdx from '@compositor/mdx'
import PropTypes from 'prop-types'

const Markdown = ({
  text = '',
  components = {},
  ...options
}, context) => {
  const contextComponents = context.components || {}
  const allComponents = Object.assign({}, components, contextComponents)

  const Document = mdx(text, {
    components: allComponents,
    ...options
  })

  return <Document />
}

Markdown.contextTypes = {
  components: PropTypes.object
}

export default Markdown
