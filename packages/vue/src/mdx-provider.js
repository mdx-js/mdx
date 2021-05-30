import {defineComponent, provide} from 'vue'

const MDXProvider = defineComponent({
  name: 'MDXProvider',
  props: {components: {type: Object, default: () => ({})}},
  setup(props) {
    provide('$mdxComponents', props.components)
  },
  render() {
    return this.$slots.default?.()
  }
})

export default MDXProvider
