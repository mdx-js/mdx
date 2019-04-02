import React from 'react'
import {Global} from '@emotion/core'
import {MDXProvider} from '@mdx-js/react'
import Head from './head'
import components from './mdx-components'

const styles = (
  <Global
    styles={{
      '*': {boxSizing: 'border-box'},
      body: {
        margin: 0,
        fontFamily: 'system-ui, sans-serif',
        lineHeight: 1.5,
        color: '#000',
        backgroundColor: '#fff'
      }
    }}
  />
)

export default props => {
  return (
    <>
      <Head />
      {styles}
      <MDXProvider components={components}>{props.children}</MDXProvider>
    </>
  )
}
