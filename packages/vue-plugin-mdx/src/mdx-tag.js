export default {
  props: {
    name: String,
    components: Object
  },
  render() {
    const Component = this.components[this.name];
    return <Component>{this.$slots.default}</Component>
  }
};