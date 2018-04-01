const toHAST = require('mdast-util-to-hast')
const hastToJsx = require('./hast-to-jsx')

module.exports = function mdxToJsx(options) {
  this.Compiler = node => {
    const handlers = {
      // `inlineCode` gets passed as `code` by the HAST transform.
      // This makes sure it ends up being `inlineCode`
      inlineCode(h, node) {
        return Object.assign({}, node, {
          type: 'element',
          tagName: 'inlineCode',
          children: [
            {
              type: 'text',
              value: node.value
            }
          ]
        })
      },
      import(h, node) {
        return Object.assign({}, node, {
          type: 'import'
        })
      },
      export(h, node) {
        return Object.assign({}, node, {
          type: 'export'
        })
      },
      jsx(h, node) {
        return Object.assign({}, node, {
          type: 'jsx'
        })
      }
    }

    const hast = toHAST(node, {
      handlers
    })

    return hastToJsx(hast)
  }
}