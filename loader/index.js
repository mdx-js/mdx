const { getOptions } = require('loader-utils')
const validateOptions = require('schema-utils')
const { getImports } = require('to-mdxast')

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

  const { imports, scope } = getImports(content)
  const escapedContent = content.replace(/`/g, '\\`')

  const code = `
  import React from 'react'
  import { Markdown } from '@compositor/markdown'

  ${imports.map(i => i.raw).join('\n')}

  export default ({
    components = {},
    ...props
  }) =>
    <Markdown
      {...props}
      components={Object.assign({}, components, { ${scope.join(', ')} })}
      text={\`${escapedContent}\`}
    />
  `

  return callback(null, code)
}
