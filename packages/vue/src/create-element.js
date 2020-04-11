/**
 * MDX default components
 */
const DEFAULTS = {
  inlineCode: 'code',
  wrapper: 'div'
}

/**
 * Renders final tag/component
 * @param {Vue.Component|String} type Element or tag to render
 * @param {Object|Array} props Props and attributes for element
 * @param {Array} children Array of child nodes for component
 * @returns {Vue.VNode} VNode of final rendered element
 */
export default function(type, props, children) {

  const h = this.createElement
  const components = this.components
  const defaults = Object.keys(DEFAULTS)

  let tag
  let elProps = props

  // We check context to see if the element/tag
  // is provided in the MDXProvider context.
  if (Object.keys(components).includes(type)) {
    // We check to see if props is of type object.
    // If it is, then we pass them into the MDXContext component
    const componentProps = typeof props === 'object' ? props : undefined
    tag = components[type](componentProps)

  } else if (defaults.includes(type)) {

    tag = DEFAULTS[type]
    // Remove components object from attrs
    const { components, ...attrs } = elProps.attrs
    elProps = {
      attrs
    }

  // Render final tag if component is not provided in context
  } else {
    tag = type

    if (['a', 'input', 'img'].includes(tag)) {
      const { attrs, ...domProps } = elProps
      const data = {
        attrs: attrs,
        domProps
      }

      elProps = {
        ...elProps,
        ...data
      }
    }
  }

  return h(tag, elProps, children)
}
