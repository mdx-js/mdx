import React, { Component } from 'react'
import mdx from '@mdx-js/mdx'
import { MDXTag } from '@mdx-js/tag'
import * as babel from 'babel-standalone'

const parse = raw =>
  babel.transform(raw, {
    plugins: [require('babel-plugin-transform-react-jsx')],
    presets: ['react', 'stage-0']
  }).code

export default class Markdown extends Component {
  state = {
    Component: null
  }

  mdxify = async () => {
    const { children, components, ...props } = this.props

    const scope = { components, ...props, MDXTag }
    const jsx = await mdx(children, { components })

    // Hacky workaround
    const code = jsx.replace(/^(\s)*export default/, '')

    const keys = Object.keys(scope)
    const values = keys.map(k => scope[k])
    const fn = new Function('React', ...keys, `return ${parse(code)}`)
    const Component = fn(React, ...values)

    this.setState({ Component })
  }

  // Should prolly recreate on props change
  componentWillMount() {
    this.mdxify()
  }

  render() {
    const { Component } = this.state

    return Component ? <Component /> : null
  }
}
