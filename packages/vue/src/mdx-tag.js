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
  inject: {
    contextComponents: {
      default: {}
    }
  },
  render() {
    if (this.Layout) {
      return (
        <this.Layout {...{attrs: this.layoutProps}}>
          {this.$slots.default}
        </this.Layout>
      )
    }
    const Component =
      this.components[this.name] ||
      this.contextComponents[this.name] ||
      this.name
    const childProps = {...this.props}
    return <Component {...childProps}>{this.$slots.default}</Component>
  }
}
