/**
 * @typedef {import('mdx/types.js').MDXComponents} Components
 * @typedef {import('vue').Component<{components?: Components | null | undefined}>} Provider
 * @typedef {import('vue').ComponentPublicInstance} ComponentPublicInstance
 */

import {Fragment, createVNode, inject, provide} from 'vue'

/**
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
 * @returns {Components}
 *   Current components.
 */
export function useMDXComponents() {
  return inject('$mdxComponents', {})
}
