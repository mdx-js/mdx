const {getOptions} = require('loader-utils')
const mdx = require('@mdx-js/mdx')

const prefix = `let h`

const suffix = `export default {
  name: 'Mdx',
  inject: {
    $mdxComponents: {
      default: () => () => ({})
    }
  },
  computed: {
    components() {
      return this.$mdxComponents()
    }
  },
  render(createElement) {
    h = createElement
    return MDXContent({components: this.components})
  }
}
`

module.exports = mdxLoader

async function mdxLoader(content) {
  const callback = this.async()
  const options = Object.assign({}, getOptions(this), {
    filepath: this.resourcePath
  })
  let result

  try {
    result = await mdx(content, {
      ...options,
      skipExport: true,
      mdxFragment: false,
      mdxProviderImportSource: null,
      // Don’t add the comments.
      jsxRuntime: null,
      pragma: null,
      pragmaFrag: null
    })
  } catch (err) {
    return callback(err)
  }

  const code = `${prefix}
${result}
${suffix}`

  return callback(null, code)
}
