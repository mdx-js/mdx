import React from 'react'
import PropTypes from 'prop-types'

import { LiveProvider, LivePreview, LiveEditor, LiveError } from 'react-live'

import * as Rebass from 'rebass'

const isDotJSX = (cx = '') => /language-\.jsx/.test(cx)

const JSXEditor = (props, context) => {
  const { children, className } = props
  const { components } = context

  // react-live doesn't like the `default` token in scope
  delete Rebass.default

  const scope = Object.assign({}, Rebass, components)

  if (!isDotJSX(className)) {
    return <pre style={{ color: 'red' }} {...props} />
  }

  return (
    <LiveProvider
      scope={scope}
      code={children.join('')}
      transform={code =>
        `<Provider><React.Fragment>${code}</React.Fragment></Provider>`
      }
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
