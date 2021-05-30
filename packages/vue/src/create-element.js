import {createVNode, Fragment} from 'vue'

/**
 * MDX default components
 */
const defaults = {
  inlineCode: 'code',
  wrapper: Fragment
}

// Const own = {}.hasOwnProperty

export default function createMdxElement(type, props, children) {
  if (props?.components?.[type]) {
    type = props.components[type]
  } else if (defaults[type]) {
    type = defaults[type]
  }

  if (!children) {
    children = []
  }

  if (props && typeof props === 'object' && !Array.isArray(props)) {
    // Empty.
  } else {
    children.unshift(props)
    props = {}
  }

  if (props.attrs) {
    // Vue places the special MDX props in `props.attrs`, move them back into
    // `props`.
    const {components, mdxType, parentName, ...attrs} = props.attrs
    props = {...props, components, mdxType, parentName, attrs}
  }

  // Just a render function.
  if (typeof type === 'function') {
    /* istanbul ignore next - V8 is really good at inferring names, but add a name anyway. */
    const name = type.displayName || type.name || 'mdxFunction'

    type = {name, render: type}
  }

  // Vue component.
  return createVNode(
    type,
    props,
    // @vue/babel-plugin-jsx should support jsxFrag pragma replacement
    type === Fragment ? children.default?.() : children
  )
}
