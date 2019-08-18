import React from 'react'
import {graphql} from 'gatsby'
import MDXRenderer from 'gatsby-plugin-mdx/mdx-renderer'

import Layout from '../components/layout'
import Head from '../components/head'

export default ({data: {doc}}) => {
  const title =
    doc.title || (doc.headings && doc.headings[0] && doc.headings[0].value)
  const description = doc.description || doc.excerpt

  return (
    <Layout>
      <Head title={title} description={description} />
      <MDXRenderer>{doc.body}</MDXRenderer>
    </Layout>
  )
}

export const pageQuery = graphql`
  query($id: String!) {
    doc: docs(id: {eq: $id}) {
      id
      title
      description
      excerpt
      body
      headings {
        value
      }
    }
  }
`
