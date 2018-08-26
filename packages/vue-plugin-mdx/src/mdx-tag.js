export default {
  props: {
    name: String,
    components: {
      type: Object,
      default: () => ({})
    },
    props: {
      type: Object,
      default: () => ({})
    },
    Layout: Object,
    layoutProps: {
      type: Object,
      default: () => ({})
    }
  },
  render() {
    if (this.Layout) {
      return (
        <this.Layout {...{ attrs: this.layoutProps, props: { components: this.components } }}>
          {this.$slots.default}
        </this.Layout>
      )
    }
    const Component = this.components[this.name]
    const childProps = {...this.props}
    return <Component {...childProps}>{this.$slots.default}</Component>
  }
}