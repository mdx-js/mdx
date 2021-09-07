const {h, Fragment} = require('preact')
const {forwardRef} = require('preact/compat')

import {useMDXComponents} from './context'

const TYPE_PROP_NAME = 'mdxType'

const DEFAULTS = {
  inlineCode: 'code',
  wrapper: ({children}) => h(Fragment, {}, children)
}

const MDXCreateElement = forwardRef((props, ref) => {
  const {
    components: propComponents,
    mdxType,
    originalType,
    parentName,
    ...etc
  } = props

  const components = useMDXComponents(propComponents)
  const type = mdxType
  const Component =
    components[`${parentName}.${type}`] ||
    components[type] ||
    DEFAULTS[type] ||
    originalType

  // To do: what is this useful for?
  /* c8 ignore next 7 */
  if (propComponents) {
    return h(Component, {
      ref,
      ...etc,
      components: propComponents
    })
  }

  return h(Component, {ref, ...etc})
})

MDXCreateElement.displayName = 'MDXCreateElement'

function mdx(type, props) {
  const args = arguments
  const mdxType = props && props.mdxType

  if (typeof type === 'string' || mdxType) {
    const argsLength = args.length

    const createElementArgArray = new Array(argsLength)
    createElementArgArray[0] = MDXCreateElement

    const newProps = {}
    for (let key in props) {
      /* istanbul ignore else - folks putting stuff in `prototype`. */
      if (hasOwnProperty.call(props, key)) {
        newProps[key] = props[key]
      }
    }

    newProps.originalType = type
    newProps[TYPE_PROP_NAME] = typeof type === 'string' ? type : mdxType

    createElementArgArray[1] = newProps

    for (let i = 2; i < argsLength; i++) {
      createElementArgArray[i] = args[i]
    }

    return h.apply(null, createElementArgArray)
  }

  return h.apply(null, args)
}

mdx.Fragment = Fragment

exports.mdx = mdx
exports.Fragment = Fragment
