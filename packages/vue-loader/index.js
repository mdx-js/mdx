const {getOptions} = require('loader-utils')
const mdx = require('@mdx-js/mdx')

const prefix = `//
import {mdx} from '@mdx-js/vue'
import {inject} from 'vue'
`

const suffix = `export default {
  name: 'Mdx',
  setup(props) {
    const $mdxComponents = inject('$mdxComponents', {})
    return () => MDXContent({components: props.components})
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
      mdxFragment: false
    })
  } catch (err) {
    return callback(err)
  }

  const code = `${prefix}
${result}
${suffix}`

  return callback(null, code)
}
