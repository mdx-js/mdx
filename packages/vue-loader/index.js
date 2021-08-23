import {getOptions} from 'loader-utils'
import {mdx} from '@mdx-js/mdx'

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

export default async function mdxLoader(content) {
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
