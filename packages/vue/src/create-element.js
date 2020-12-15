/**
 * MDX default components
 */
const defaults = {
  inlineCode: 'code',
  wrapper: {
    name: 'MDXWrapper',
    render: function (h) {
      const children = this.$slots.default
      return children.length === 1 ? children : h('div', {}, children)
    }
  }
}

const own = {}.hasOwnProperty

export default function createMdxElement(type, props, children) {
  if (own.call(this.components, type)) {
    type = this.components[type]
  } else if (own.call(defaults, type)) {
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

  children = children.map(d =>
    typeof d === 'number' || typeof d === 'string'
      ? this.createElement('d', {}, String(d)).children[0]
      : d
  )

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
  return this.createElement(type, props, children)
}
