import toHast from 'mdast-util-to-hast'
import toHyper from 'hast-to-hyperscript'

import { createElement } from 'react'

import isLiveEditor from './is-live-editor'
import LiveEditor from './LiveEditor'

export default function transformer (options) {
  const components = options.components || {}
  const scope = options.scope || {}
  const theme = options.theme || {}

  const h = (name, props = {}, children = []) => {
      const child = children[0]
      if (child && isLiveEditor(child.props || {})) {
        name = 'paragraph'
      }

      return isLiveEditor(props)
        ? liveEditorComponent(props, children)
        : createElement(components[name] || name, props, children)
    }

  const liveEditorComponent = (props, children) => {
    const code = children[0] || ''

    const editorProps = Object.assign({}, props, {
      components: scope,
      theme,
      code
    })

    return createElement(
      options.LiveEditor || LiveEditor,
      editorProps,
      code
    )
  }

  this.Compiler = node =>
    toHyper(h, {
      type: 'element',
      tagName: 'div',
      properties: {},
      children: toHast(node).children
    })
}
