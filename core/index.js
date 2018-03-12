const unified = require('unified')
const toMDAST = require('remark-parse')
const emoji = require('remark-emoji')
const squeeze = require('remark-squeeze-paragraphs')
const toc = require('remark-toc')
const images = require('remark-images')
const toMDXAST = require('to-mdxast')
const toHAST = require('mdast-util-to-hast')

function renderer (options) {
  this.Compiler = node => {
    const handlers = {
      // `inlineCode` gets passed as `code` by the HAST transform.
      // This makes sure `inlineCode` is used when it's defined by the user
      inlineCode(h, node) {
        return Object.assign({}, node, {
          type: 'element',
          tagName: 'inlineCode',
          children: [{
            type: 'text',
            value: node.value
          }]
        })
      },
      // Remove imports from output
      import(h, node) {
        return Object.assign({}, node, {
          type: 'import'
        })
      },
      // Coerce the JSX node into a node structure that `walk`
      // will accept. This will later be passed on to toElement
      // for node rendering within the given scope.
      jsx(h, node) {
        return Object.assign({}, node, {
          type: 'jsx'
        })
      }
    }

    const hast = toHAST(node, {
      handlers
    })

    const walk = (node) => {
      let children = ''

      if(node.type === 'root') {
        const importNodes = node.children.filter((node) => node.type === 'import').map(walk).join('\n')
        const otherNodes = node.children.filter((node) => node.type !== 'import').map(walk).join('')
        return importNodes + '\n' + `export default ({components}) => <Tag name="wrapper">${otherNodes}</Tag>`
      }

      // recursively walk through children
      if(node.children) {
        children = node.children.map(walk).join('')
      }

      if(node.type === 'element') {
        if(node.tagName === 'code') {
          children = '{`' + children.replace(/`/g, '\\`') + '`}'
        }
        return `<Tag name="${node.tagName}" components={components} props={${JSON.stringify(node.properties)}}>${children}</Tag>`
      }

      if(node.type === 'jsx') {
        return node.value
      }

      if(node.type === 'text' || node.type === 'import') {
        return node.value
      }
    }

    const result = walk(hast)
    return result
  }
}

module.exports = function (mdx, options = {}) {
  options.components = options.components || {}
  options.blocks = ['[a-z]+(\\.){0,1}[a-z]']
  const plugins = options.plugins || []
  const compilers = options.compilers || []

  const fn = unified()
    .use(toMDAST, options)
    .use(emoji, options)
    .use(images, options)
    .use(squeeze, options)
    .use(toMDXAST, options)

  plugins.forEach(plugins => fn.use(plugins, options))

  fn.use(options.renderer || renderer, options)

  compilers.forEach(compiler => fn.use(compiler, options))

  return fn.processSync(mdx).contents
}
