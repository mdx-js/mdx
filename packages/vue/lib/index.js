/**
 * @typedef {import('mdx/types.js').MDXComponents} MDXComponents
 * @typedef {import('vue').Component<Props>} Provider
 * @typedef {import('vue').ComponentPublicInstance} ComponentPublicInstance
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
 * @type {Provider}
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
  setup(props) {
    provide('$mdxComponents', props.components)
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
