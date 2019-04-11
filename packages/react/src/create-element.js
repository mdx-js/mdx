import React from 'react'

import {useMDXComponents} from './context'

const TYPE_PROP_NAME = 'mdxType'

const DEFAULTS = {
  inlineCode: 'code',
  wrapper: React.Fragment
}

const MDXCreateElement = ({
  components: propComponents,
  mdxType,
  originalType,
  parentName,
  ...etc
}) => {
  const components = useMDXComponents(propComponents)
  const type = mdxType
  const Component =
    components[`${parentName}.${type}`] ||
    components[type] ||
    DEFAULTS[type] ||
    originalType

  return React.createElement(Component, etc)
}
MDXCreateElement.displayName = 'MDXCreateElement'

export default function(type, props = {}) {
  const args = arguments

  if (typeof type === 'string' || props.mdxType) {
    const argsLength = args.length

    const createElementArgArray = new Array(argsLength)
    createElementArgArray[0] = MDXCreateElement

    const newProps = {}
    for (let key in props) {
      if (hasOwnProperty.call(props, key)) {
        newProps[key] = props[key]
      }
    }
    newProps.originalType = type
    newProps[TYPE_PROP_NAME] = typeof type === 'string' ? type : props.mdxType

    createElementArgArray[1] = newProps

    for (let i = 2; i < argsLength; i++) {
      createElementArgArray[i] = args[i]
    }

    return React.createElement.apply(null, createElementArgArray)
  }

  return React.createElement.apply(null, args)
}
