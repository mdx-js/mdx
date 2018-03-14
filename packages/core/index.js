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
      // This makes sure it ends up being `inlineCode`
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

    const walk = (node) => {
      let children = ''

      if(node.type === 'root') {
        const importNodes = node.children.filter((node) => node.type === 'import').map(walk).join('\n')
        const exportNodes = node.children.filter((node) => node.type === 'export').map(walk).join('\n')
        const otherNodes = node.children.filter((node) => node.type !== 'import' && node.type !== 'export').map(walk).join('')
        return importNodes + '\n' + exportNodes + '\n' + `export default ({components}) => <MDXTag name="wrapper">${otherNodes}</MDXTag>`
      }

      // recursively walk through children
      if(node.children) {
        children = node.children.map(walk).join('')
      }

      if(node.type === 'element') {
        // This makes sure codeblocks can hold code and backticks
        if(node.tagName === 'code') {
          children = '{`' + children.replace(/`/g, '\\`').replace(/\$/g, '\\$') + '`}'
        }

        return `<MDXTag name="${node.tagName}" components={components} props={${JSON.stringify(node.properties)}}>${children}</MDXTag>`
      }

      if(node.type === 'text' || node.type === 'import' || node.type === 'export' || node.type === 'jsx') {
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
