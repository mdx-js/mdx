const { getOptions } = require('loader-utils')
const validateOptions = require('schema-utils')
const { metadata } = require('@compositor/markdown')

const schema = {
  type: 'object',
  properties: {
    // TODO
  }
}

module.exports = function (content) {
  const callback = this.async()
  const options = getOptions(this)
  //validateOptions(schema, options)

  const data = metadata(content)
  const imports = data.imports.map(i => i.raw).join('\n')
  const importScope = `{ ${data.importScope.join(', ')} }`
  const escapedContent = content.replace(/`/g, '\\`')

  const code = `
  import React from 'react'
  import { Markdown } from '@compositor/markdown'

  ${imports}

  export default ({
    components = {},
    ...props
  }) =>
    <Markdown
      {...props}
      components={Object.assign({}, components, ${importScope})}
      text={\`${escapedContent}\`}
    />
  `

  return callback(null, code)
}
