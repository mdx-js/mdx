/**
 * @import {MDXComponents} from 'mdx/types.js'
 * @import {Component, ComponentPublicInstance} from 'vue'
 */

/**
 * @typedef Props
 *   Configuration for `MDXProvider`.
 * @property {MDXComponents | null | undefined} [components]
 *   Additional components to use (optional).
 */

import {Fragment, createVNode, inject, provide} from 'vue'

/**
 * Provider for MDX context.
 *
 * @type {Component<Props>}
 *   Provider.
 */
export const MDXProvider = {
  name: 'MDXProvider',
  props: {
    components: {
      default() {
        return {}
      },
      type: Object
    }
  },
  setup(properties) {
    provide('$mdxComponents', properties.components)
  },
  /**
   * @this {ComponentPublicInstance}
   *   Context.
   * @returns
   *   Element.
   */
  render() {
    return createVNode(
      Fragment,
      undefined,
      this.$slots.default ? this.$slots.default() : []
    )
  }
}

/**
 * Get current components from the MDX Context.
 *
 * @returns {MDXComponents}
 *   Current components.
 */
export function useMDXComponents() {
  return inject('$mdxComponents', {})
}
