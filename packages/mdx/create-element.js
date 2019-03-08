const React = require('react')
const {useMDXComponents} = require('@mdx-js/tag')

const TYPE_PROP_NAME = '__MDX_TYPE_PLEASE_DO_NOT_USE__'

const DEFAULTS = {
  inlineCode: 'code',
  wrapper: 'div'
}

const MDXCreateElement = ({
  components: propComponents,
  __MDX_TYPE_PLEASE_DO_NOT_USE__,
  parentName,
  ...etc
}) => {
  const components = useMDXComponents(propComponents)
  const type = __MDX_TYPE_PLEASE_DO_NOT_USE__
  const Component =
    components[`${parentName}.${type}`] ||
    components[type] ||
    DEFAULTS[type] ||
    type

  return React.createElement(Component, etc)
}
MDXCreateElement.displayName = 'MDXCreateElement'

module.exports = function(type, props) {
  const args = arguments

  if (typeof type === 'string') {
    const argsLength = args.length

    const createElementArgArray = new Array(argsLength)
    createElementArgArray[0] = MDXCreateElement

    const newProps = {}
    for (let key in props) {
      if (hasOwnProperty.call(props, key)) {
        newProps[key] = props[key]
      }
    }

    newProps[TYPE_PROP_NAME] = type

    createElementArgArray[1] = newProps

    for (let i = 2; i < argsLength; i++) {
      createElementArgArray[i] = args[i]
    }

    return React.createElement.apply(null, createElementArgArray)
  }

  return React.createElement.apply(null, args)
}
