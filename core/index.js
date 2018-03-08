const unified = require('unified')
const toMDAST = require('remark-parse')
const emoji = require('remark-emoji')
const squeeze = require('remark-squeeze-paragraphs')
const toc = require('remark-toc')
const images = require('remark-images')
const matter = require('remark-frontmatter')
const toMDXAST = require('to-mdxast')
const toHAST = require('mdast-util-to-hast')
const yaml = require('js-yaml')

function renderer (options) {
  const components = options.components

  const parseFrontmatter = node => {
    const frontmatterNode = node.children.find(n => n.type === 'yaml')
    return frontmatterNode ? yaml.safeLoad(frontmatterNode.value) : {}
  }

  this.Compiler = node => {
    const frontmatter = parseFrontmatter(node)
    const scope = Object.assign({}, components, frontmatter, {
      props: options.props || {}
    })

    const handlers = {
      yaml() {},
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
          type: 'text'
        })
      }
    }

    // `inlineCode` gets passed as `code` by the HAST transform.
    // This makes sure `inlineCode` is used when it's defined by the user
    if(components.inlineCode) {
      handlers.inlineCode = (h, node) => {
        return Object.assign({}, node, {
          type: 'element',
          tagName: 'inlineCode',
          children: [{
            type: 'text',
            value: node.value
          }]
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
        return importNodes + '\n' + `export default () => <Tag name="wrapper">${otherNodes}</Tag>`
      }

      // recursively walk through children
      if(node.children) {
        children = node.children.map(walk).join('')
      }

      if(node.type === 'element') {        
        return `<Tag name="${node.tagName}" props={${JSON.stringify(node.properties)}}>${children}</Tag>`
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
  const plugins = options.plugins || []
  const compilers = options.compilers || []

  const fn = unified()
    .use(toMDAST, options)
    .use(emoji, options)
    .use(matter, { type: 'yaml', marker: '-' })
    .use(images, options)
    .use(squeeze, options)
    .use(toMDXAST, options)

  plugins.forEach(plugins => fn.use(plugins, options))

  fn.use(options.renderer || renderer, options)

  compilers.forEach(compiler => fn.use(compiler, options))

  return fn.processSync(mdx).contents
}
