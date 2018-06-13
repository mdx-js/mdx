import React from 'react'
import PropTypes from 'prop-types'

import { withMDXComponents } from './mdx-provider'

const defaults = {
  inlineCode: 'code',
  wrapper: 'div'
}

const MDXTag = props => {
  const {
    name,
    parentName,
    props: childProps = {},
    children,
    components = {},
    Layout
  } = props
  const Component =
    components[`${parentName}.${name}`] ||
    components[name] ||
    defaults[name] ||
    name

  if (Layout) {
    return <Layout components={components}>
      <Component {...childProps}>{children}</Component>
    </Layout>
  }

  return <Component {...childProps}>{children}</Component>
}

export default withMDXComponents(MDXTag)
