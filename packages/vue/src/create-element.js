import h from 'hastscript'
import toH from 'hast-to-hyperscript'

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

export default function (type, props, ...children) {
  let node

  if (own.call(this.components, type)) {
    type = this.components[type]
  } else if (own.call(defaults, type)) {
    type = defaults[type]
  }

  if (props && typeof props === 'object' && !Array.isArray(props)) {
    // Empty.
  } else {
    children.unshift(props)
    props = {}
  }

  children = children
    .flatMap(d => (d == null ? [] : d))
    .map(d =>
      typeof d === 'number' || typeof d === 'string'
        ? this.createElement('d', {}, String(d)).children[0]
        : d
    )

  if (typeof type === 'string') {
    node = toH(
      this.createElement,
      h(
        type,
        Object.assign({}, props, {
          components: null,
          mdxType: null,
          parentName: null
        })
      ),
      {prefix: false}
    )
    node.children = children
    return node
  }

  // Just a render function.
  if (typeof type === 'function') {
    /* istanbul ignore next - V8 is really good at inferring names, but add a name anyway. */
    const name = type.displayName || type.name || 'mdxFunction'

    type = {name, render: type}
  }

  // Vue component.
  return this.createElement(type, {props}, children)
}
