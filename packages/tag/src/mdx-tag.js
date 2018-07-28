import React, { Component } from 'react'
import hoistStatics from 'hoist-non-react-statics'

import { withMDXComponents } from './mdx-provider'

const defaults = {
  inlineCode: 'code',
  wrapper: 'div'
}

class MDXTag extends Component {
  render() {
    const {
      name,
      parentName,
      props: childProps = {},
      children,
      components = {},
      Layout,
      layoutProps
    } = this.props

    const Component =
      components[`${parentName}.${name}`] ||
      components[name] ||
      defaults[name] ||
      name

    if (Layout) {
      hoistStatics(this, Layout)

      return (
        <Layout components={components} {...layoutProps}>
          <Component {...childProps}>{children}</Component>
        </Layout>
      )
    }

    return <Component {...childProps}>{children}</Component>
  }
}

export default withMDXComponents(MDXTag)
