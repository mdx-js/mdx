import React from 'react'
import Layout from './components/layout'
import Head from './components/head'

export const wrapRootElement = ({element, props}) => (
  <>
    <Head />
    <Layout {...props}>{element}</Layout>
  </>
)
