import React from 'react'
import PropTypes from 'prop-types'

import {
  LiveProvider,
  LivePreview,
  LiveEditor,
  LiveError
} from 'react-live'

const isDotJSX = (cx = '') => /language-\.jsx/.test(cx)

const JSXEditor = (props, context) => {
  const { children, className } = props
  const { components } = context

  if (!isDotJSX(className)) {
    return (
      <pre
        style={{ color: 'red' }}
        {...props}
      />
    )
  }

  return (
    <LiveProvider
      scope={components}
      code={children.join('')}
    >
      <LivePreview />
      <LiveEditor />
      <LiveError />
    </LiveProvider>
  )
}

JSXEditor.contextTypes = {
  components: PropTypes.object
}

export default JSXEditor
