const {getOptions} = require('loader-utils')
const mdx = require('@mdx-js/mdx')
const path = require('path')

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
import { mdx } from '${path
    .dirname(require.resolve('@mdx-js/vue/package.json'))
    .replace(/\\/g, '/')}'
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
