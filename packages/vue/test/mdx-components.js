const components = {
  inlineCode: props => ({
    name: 'InlineCode',
    render(h) {
      return h('code', {
        attrs: {
          id: 'mdx-code',
          style: {
            color: 'currentColor',
            fontFamily: 'monospace, mono',
            fontSize: '0.85em'
          }
        },
        domProps: {
          ...props
        }
      }, this.$slots.default)
    }
  }),
  h1: props => ({
    name: 'Heading',
    render(h) {
      return h('h1', {
        attrs: {
          id: 'mdx-h1',
          style: {
            fontWeight: 'bold',
          }
        },
        domProps: {
          ...props
        }
      }, this.$slots.default)
    }
  }),
  blockquote: props => ({
    name: 'BlockQuote',
    render(h) {
      return h('blockquote', {
        attrs: {
          id: 'mdx-blockquote',
          style: {
            borderLeft: '5px solid tomato',
            borderRadius: '0.5rem',
            marginTop: '3rem',
            marginBottom: '3rem',
          }
        },
        domProps: {
          ...props
        }
      }, this.$slots.default)
    }
  }),
}

export default components
