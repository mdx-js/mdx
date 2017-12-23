import toHast from 'mdast-util-to-hast'
import toHyper from 'hast-to-hyperscript'

import { createElement } from 'react'

import isLiveEditor from './is-live-editor'
import LiveEditor from './LiveEditor'

module.exports = function transformer (options) {
  const mdComponents = options.mdComponents || {}
  const components = options.components || {}
  const theme = options.theme || {}

  const h = (name, props, children) => {
    const component = mdComponents[name] || name

    return createElement(component, props, children)
  }

  const transformLiveEditor = (node, components) => {
    const children = node.children || []
    const code = (children[0] || {}).value || ''

    const props = Object.assign({}, node.properties, {
      components,
      theme,
      code
    })

    return createElement(LiveEditor, props, code)
  }

  const transform = node => {
    return toHyper(h, {
      type: 'element',
      tagName: 'div',
      properties: {},
      children: toHast(node).children
    })
  }

  const compiler = node => isLiveEditor(node)
    ? transformLiveEditor(node, components)
    : transform(node)

  this.Compiler = compiler
}
