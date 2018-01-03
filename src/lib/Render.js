import React from 'react'
import classnamify from 'classnamify'

import {
  LiveProvider,
  LivePreview
} from 'react-live'

export default ({
  components,
  code,
  className,
  ...props
})  => {
  return (
    <LiveProvider
      code={code}
      scope={components}
      mountStylesheet={false}
      {...props}
    >
      <LivePreview />
    </LiveProvider>
  )
}
