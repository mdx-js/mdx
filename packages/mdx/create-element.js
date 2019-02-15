import * as React from 'react'
import {withMDXComponents} from '@mdx-js/tag/dist/mdx-provider'

const typePropName = '__MDX_TYPE_PLEASE_DO_NOT_USE__'

// Let MDXElement = withMDXComponents(theme => render(cache, props, theme, ref))

const defaults = {
  inlineCode: 'code',
  wrapper: 'div'
}

const MDX = withMDXComponents(
  ({components = {}, __MDX_TYPE_PLEASE_DO_NOT_USE__, parentName, ...etc}) => {
    const type = __MDX_TYPE_PLEASE_DO_NOT_USE__
    console.log('type', components)
    const Component =
      components[`${parentName}.${type}`] ||
      components[type] ||
      defaults[type] ||
      type

    return React.createElement(Component, etc)
  }
)

export default function(type, props) {
  let args = arguments

  if (typeof type === 'string') {
    console.log(type)
    const argsLength = args.length

    const createElementArgArray = new Array(argsLength)

    createElementArgArray[0] = MDX
    const newProps = {}

    for (let key in props) {
      if (hasOwnProperty.call(props, key)) {
        newProps[key] = props[key]
      }
    }
    newProps[typePropName] = type

    createElementArgArray[1] = newProps

    for (let i = 2; i < argsLength; i++) {
      createElementArgArray[i] = args[i]
    }
    return React.createElement.apply(null, createElementArgArray)
  }
  return React.createElement.apply(null, args)
}
