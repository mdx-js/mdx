import React from 'react'
import Layout from './components/layout'

export const wrapRootElement = ({element, props}) => (
  <Layout {...props}>{element}</Layout>
)
