const MDXProvider = {
  name: 'MDXProvider',
  props: {components: {type: Object, default: () => ({})}},
  provide() {
    return {$mdxComponents: () => this.components}
  },
  render() {
    return this.$slots.default
  }
}

export default MDXProvider
