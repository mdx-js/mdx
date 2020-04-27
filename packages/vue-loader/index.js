const {getOptions} = require('loader-utils')
const mdx = require('@mdx-js/mdx')

module.exports = async function (content) {
  const callback = this.async()
  const options = Object.assign({}, getOptions(this), {
    filepath: this.resourcePath
  })
  let result

  try {
    result = await mdx(content, {...options, skipExport: true})
  } catch (err) {
    return callback(err)
  }

  const code = `// vue babel plugin doesn't support pragma replacement
import { mdx } from '@mdx-js/vue'
let h;
${result}

export default {
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
    h = mdx.bind({ createElement, components: this.components })
    return MDXContent({ components: this.components })
  }
}
   `
  return callback(null, code)
}
