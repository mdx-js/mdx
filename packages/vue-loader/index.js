const {getOptions} = require('loader-utils')
const mdx = require('@mdx-js/mdx')

const prefix = `// Vue babel plugin doesn't support pragma replacement
import {mdx} from '@mdx-js/vue'
let h
`

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
    h = mdx.bind({createElement, components: this.components})
    return MDXContent({components: this.components})
  }
}
`

module.exports = mdxLoader

async function mdxLoader(content) {
  const callback = this.async()
  const options = {...getOptions(this), filepath: this.resourcePath}
  let result

  try {
    result = await mdx(content, {
      ...options,
      skipExport: true,
      mdxFragment: false
    })
  } catch (err) {
    return callback(err)
  }

  const code = `${prefix}
${result}
${suffix}`

  // V8 bug on Node 12.
  /* c8 ignore next 2 */
  return callback(null, code)
}
