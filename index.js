import unified from 'unified'
import parse from 'remark-parse'
import toHast from 'mdast-util-to-hast'
import toHyper from 'hast-to-hyperscript'

import { createElement } from 'react'

import isLiveEditor from './lib/is-live-editor'
import LiveEditor from './lib/LiveEditor'

const markdown = (md, options = {}) => {
  const mdComponents = options.mdComponents || {}
  const components = options.components || {}
  const theme = options.theme || {}

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
    const component = mdComponents[node.tagName] || node.tagName

    return createElement(component, node.properties, node.children)
  }

  const compile = node => isLiveEditor(node)
    ? transformLiveEditor(node, components)
    : transform(node)

  const tree = unified()
    .use(parse)
    .parse(md)

  return toHast(tree).children.map(compile)
}

module.exports = markdown
