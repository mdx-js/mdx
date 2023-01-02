/**
 * @typedef {import('mdx/types.js').MDXComponents} Components
 */

import {provide, inject, createVNode, Fragment} from 'vue'

/** @type {import('vue').Component<{components?: Components}>} */
export const MDXProvider = {
  name: 'MDXProvider',
  props: {components: {type: Object, default: () => ({})}},
  setup(props) {
    provide('$mdxComponents', props.components)
  },
  /**
   * @this {import('vue').ComponentPublicInstance}
   */
  render() {
    return createVNode(
      Fragment,
      null,
      this.$slots.default ? this.$slots.default() : []
    )
  }
}

/** @returns {Components} */
export function useMDXComponents() {
  return inject('$mdxComponents', {})
}
