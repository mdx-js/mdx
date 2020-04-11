/**
 * MDXProvider component
 *
 * This component custom components from the user and
 * provides them to the context tree for all output markdown.
 *
 */
const MDXProvider = {
  name: 'MDXProvider',
  props: {
    components: {
      type: Object,
      default: () => ({})
    },
  },
  provide() {
    return {
      $mdxComponents: () => this.components
    };
  },
  render(h) {
    return h('div', this.$slots.default);
  }
};

export default MDXProvider
