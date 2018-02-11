const { getOptions } = require('loader-utils')
const validateOptions = require('schema-utils')

const schema = {
  type: 'object',
  properties: {
    foo: {
      type: 'string'
    }
  }
}

module.exports = function (content) {
  const callback = this.async()
  const options = getOptions(this)
  //validateOptions(schema, options)

  const escapedContent = content.replace(/`/g, '\\`')

  const code = `
  import React from 'react'
  import { Markdown } from '../../dist/index.js'

  export default props =>
    <Markdown
      {...props}
      text={\`${escapedContent}\`}
    />
  `

  return callback(null, code)
}
