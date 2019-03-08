export default {
  props: {
    components: Object,
    required: true
  },
  provide() {
    return {
      contextComponents: this.components
    }
  },
  render() {
    return <div>{this.$slots.default}</div>
  }
}
