/**
 * @typedef {import('../complex-types').Components} Components
 */

import {createVNode, Fragment} from 'vue'
import {provide, inject} from 'vue'

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
    return createVNode(Fragment, null, this.$slots.default ? this.$slots.default() : [])
  }
}

/** @returns {Components} */
export function useMDXComponents() {
  return inject('$mdxComponents', {})
}
