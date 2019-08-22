const toHAST = require('mdast-util-to-hast')
const detab = require('detab')
const u = require('unist-builder')

function mdxAstToMdxHast() {
  return (tree, _file) => {
    const handlers = {
      code(h, node) {
        // TODO: See if this detab is really necessary
        const value = node.value ? detab(node.value + '\n') : ''
        const lang = node.lang
        const props = {}

        if (lang) {
          props.className = ['language-' + lang]
        }

        // MDAST sets `node.meta` to `null` instead of `undefined` if
        // not present, which React doesn't like.
        if (node.meta) {
          props.metastring = node.meta
        } else {
          delete props.metastring
        }

        const meta =
          node.meta &&
          node.meta.split(' ').reduce((acc, cur) => {
            if (cur.split('=').length > 1) {
              const t = cur.split('=')
              acc[t[0]] = t[1]
              return acc
            }

            acc[cur] = true
            return acc
          }, {})

        if (meta) {
          Object.keys(meta).forEach(key => {
            props[key] = meta[key]
          })
        }

        return h(node.position, 'pre', [
          h(node, 'code', props, [u('text', value)])
        ])
      },
      import(_h, node) {
        return Object.assign({}, node, {
          type: 'import'
        })
      },
      export(_h, node) {
        return Object.assign({}, node, {
          type: 'export'
        })
      },
      comment(_h, node) {
        return Object.assign({}, node, {
          type: 'comment'
        })
      },
      jsx(_h, node) {
        return Object.assign({}, node, {
          type: 'jsx'
        })
      }
    }

    const hast = toHAST(tree, {
      handlers,
      // Enable passing of HTML nodes to HAST as raw nodes
      allowDangerousHTML: true
    })

    return hast
  }
}

module.exports = mdxAstToMdxHast
