const {getOptions} = require('loader-utils')
const mdx = require('@mdx-js/mdx')

module.exports = async function(content) {
  const callback = this.async()
  const options = Object.assign({}, getOptions(this), {
    filepath: this.resourcePath
  })
  let result

  try {
    result = await mdx(content, options)
  } catch (err) {
    return callback(err)
  }

  console.log(result)

  const code = `
  import { mdx as h } from '@mdx-js/vue'
  ${result}
  `

  return callback(null, code)
}
