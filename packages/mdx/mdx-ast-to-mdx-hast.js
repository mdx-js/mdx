const toHast = require('mdast-util-to-hast')
const all = require('mdast-util-to-hast/lib/all')
const detab = require('detab')
const u = require('unist-builder')

function mdxAstToMdxHast() {
  return tree => {
    return toHast(tree, {
      handlers: {
        // `inlineCode` gets passed as `code` by the HAST transform.
        // This makes sure it ends up being `inlineCode`
        inlineCode(h, node) {
          return h(node, 'inlineCode', [{type: 'text', value: node.value}])
        },
        code(h, node) {
          const value = node.value ? detab(node.value + '\n') : ''
          const lang = node.lang
          const props = {}

          if (lang) {
            props.className = ['language-' + lang]
          }

          props.metastring = node.meta

          // To do: this handling seems not what users expect:
          // <https://github.com/mdx-js/mdx/issues/702>.
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
              const isClassKey = key === 'class' || key === 'className'
              if (props.className && isClassKey) {
                props.className.push(meta[key])
              } else {
                props[key] = meta[key]
              }
            })
          }

          return h(node.position, 'pre', [
            h(node, 'code', props, [u('text', value)])
          ])
        },
        // To do: rename to `mdxJsImport`
        import(h, node) {
          return Object.assign({}, node, {type: 'import'})
        },
        // To do: rename to `mdxJsExport`
        export(h, node) {
          return Object.assign({}, node, {type: 'export'})
        },
        mdxBlockElement(h, node) {
          return Object.assign({}, node, {children: all(h, node)})
        },
        mdxSpanElement(h, node) {
          return Object.assign({}, node, {children: all(h, node)})
        },
        mdxBlockExpression(h, node) {
          return Object.assign({}, node, {type: 'mdxBlockExpression'})
        },
        mdxSpanExpression(h, node) {
          return Object.assign({}, node, {type: 'mdxSpanExpression'})
        }
      }
    })
  }
}

module.exports = mdxAstToMdxHast
