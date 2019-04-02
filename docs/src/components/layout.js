import React from 'react'
import {Global} from '@emotion/core'
import Head from './head'

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
      {props.children}
    </>
  )
}
