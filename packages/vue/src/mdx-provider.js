const MDXProvider = {
  name: 'MDXProvider',
  props: {components: {type: Object, default: () => ({})}},
  provide() {
    return {$mdxComponents: () => this.components}
  },
  render(h) {
    return h('div', this.$slots.default)
  }
}

exports.MDXProvider = MDXProvider
