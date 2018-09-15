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
        const langRegex = /^[^ \t]+(?=[ \t]|$)/
        const value = node.value ? detab(node.value + '\n') : ''
        const lang = node.lang && node.lang.match(langRegex)
        const props = {}

        if (lang) {
          props.className = ['language-' + lang]
        }

        props.metaString = node.lang && node.lang.replace(langRegex, '').trim()

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

        meta && Object.keys(meta).forEach(key => (props[key] = meta[key]))

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
      comment(h, node) {
        return Object.assign({}, node, {
          type: 'comment'
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
