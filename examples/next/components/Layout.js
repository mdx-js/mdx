import React from 'react'
import {Container, baseStyles} from 'unified-ui'

const Style = ({children}) => (
  <style
    dangerouslySetInnerHTML={{
      __html: children
    }}
  />
)

export default props => (
  <>
    <Style>{baseStyles}</Style>
    <Container {...props} />
  </>
)
