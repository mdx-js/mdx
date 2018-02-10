import toHast from 'mdast-util-to-hast'
import toHyper from 'hast-to-hyperscript'
import isVoid from 'is-void-element'

import { createElement } from 'react'
import { safeLoad as yaml } from 'js-yaml'

import JSXCodeBlock from './JSXCodeBlock'

import { isJSXCodeBlock } from './util'

export default function transformer (options) {
  const components = options.components || {}
  const theme = options.theme || {}
  const props = options.props || {}

  Object.keys(components).forEach(name => {
    const component = components[name]
    component.defaultProps = component.defaultProps
      ? Object.assign({}, props[name] || {}, component.defaultProps)
      : props[name]
  })

  const h = (name, props = {}, children = []) => {
      if (isVoid(name)) {
        return createElement(components[name] || name, props)
      }

      const child = children[0] || {}
      const childProps = child.props || {}
      if (isJSXCodeBlock(childProps)) {
        name = 'div'
      }

      return isJSXCodeBlock(props)
        ? jsxComponent(props, children)
        : createElement(components[name] || name, props, children)
    }

  const jsxComponent = (props, children = []) => {
    const code = children[0] || ''

    const editorProps = Object.assign({}, props, {
      frontmatter: this.frontmatter,
      components,
      theme,
      code
    })

    return createElement(
      JSXCodeBlock,
      editorProps,
      code
    )
  }

  const parseFrontmatter = node => {
    const frontmatter = node.children.find(s => s.type === 'yaml')

    try {
      this.frontmatter = yaml(frontmatter ? frontmatter.value : '')
    } catch (e) {
      console.error('Error parsing frontmatter')
    }
  }

  this.Compiler = node => {
    parseFrontmatter(node)

    return toHyper(h, {
      type: 'element',
      tagName: 'div',
      properties: {},
      children: toHast(node).children
    })
  }
}
