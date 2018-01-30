import toHast from 'mdast-util-to-hast'
import toHyper from 'hast-to-hyperscript'
import isVoid from 'is-void-element'

import { createElement } from 'react'

import isLiveEditor from './is-live-editor'
import shouldRender from './should-render'
import LiveEditor from './LiveEditor'
import Render from './Render'

export default function transformer (options) {
  const components = options.components || {}
  const scope = options.scope || {}
  const theme = options.theme || {}

  const h = (name, props = {}, children = []) => {
      if (isVoid(name)) {
        return createElement(components[name] || name, props)
      }

      const child = children[0] || {}
      const childProps = child.props || {}
      if (isLiveEditor(childProps) || shouldRender(childProps)) {
        name = 'div'
      }

      if (isLiveEditor(props) || shouldRender(props)) {
        return isLiveEditor(props)
          ? liveEditorComponent(props, children)
          : renderComponent(props, children)
      } else {
        return createElement(components[name] || name, props, children)
      }
    }

  const liveEditorComponent = (props, children = []) => {
    const code = children[0] || ''

    const editorProps = Object.assign({}, props, {
      components,
      scope,
      theme,
      code
    })

    return createElement(
      options.LiveEditor || LiveEditor,
      editorProps,
      code
    )
  }

  const renderComponent = (props, children) => {
    const code = children[0] || ''

    const editorProps = Object.assign({}, props, {
      components,
      scope,
      theme,
      code
    })

    return createElement(
      Render,
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
