import React from 'react'
import {MDXProvider} from '@mdx-js/react'
import {Container, baseStyles} from 'unified-ui'
import * as shortcodes from '@blocks/kit'

const Style = ({children}) => (
  <style
    dangerouslySetInnerHTML={{
      __html: children
    }}
  />
)

export default props => (
  <MDXProvider components={shortcodes}>
    <>
      <Style>{baseStyles}</Style>
      <Container {...props} />
    </>
  </MDXProvider>
)
