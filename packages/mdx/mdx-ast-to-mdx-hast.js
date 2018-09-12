const toHAST = require('mdast-util-to-hast')
const detab = require('detab')
const u = require('unist-builder')

module.exports = function mdxAstToMdxHast() {
  return (tree, file) => {
    const handlers = {
      // `inlineCode` gets passed as `code` by the HAST transform.
      // This makes sure it ends up being `inlineCode`
      inlineCode(h, node) {
        return Object.assign({}, node, {
          type: 'element',
          tagName: 'inlineCode',
          properties: {},
          children: [
            {
              type: 'text',
              value: node.value
            }
          ]
        })
      },
      code(h, node) {
        var value = node.value ? detab(node.value + '\n') : ''
        var lang = node.lang && node.lang.match(/^[^ \t]+(?=[ \t]|$)/)
        var props = {}

        if (lang) {
          props.className = ['language-' + lang]
        }

        props.metaString =
          node.lang && node.lang.replace(/^[^ \t]+(?=[ \t]|$)/, '').trim()

        const meta =
          props.metaString &&
          props.metaString.split(' ').reduce((acc, cur) => {
            if (cur.split('=').length > 1) {
              const t = cur.split('=')
              acc[t[0]] = t[1]
              return acc
            } else {
              acc[cur] = true
              return acc
            }
          }, {})

        meta &&
          Object.entries(meta).forEach(([key, value]) => (props[key] = value))

        return h(node.position, 'pre', [
          h(node, 'code', props, [u('text', value)])
        ])
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

    const hast = toHAST(tree, {
      handlers
    })

    return hast
  }
}
