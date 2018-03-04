const unified = require('unified')
const toMDAST = require('remark-parse')
const emoji = require('remark-emoji')
const squeeze = require('remark-squeeze-paragraphs')
const toc = require('remark-toc')
const images = require('remark-images')
const matter = require('remark-frontmatter')
const visit = require('unist-util-visit')
const toMDXAST = require('to-mdxast')
const toHAST = require('mdast-util-to-hast')
const toHyper = require('hast-to-hyperscript')
const toElement = require('to-element')
const yaml = require('js-yaml')

const { getImports } = require('to-mdxast')
const { createElement } = require('react')

function renderer (options) {
  const components = options.components

  const el = scope => (name, props = {}, children) => {
    if (name === 'jsx') {
      return toElement(children[0], scope)
    }

    const component = components[name] || name
    return createElement(component, props, children)
  }

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
      // Remove imports from output
      import: () => {},
      // Coerce the JSX node into a node structure that toHyper
      // will accept. This will later be passed on to toElement
      // for node rendering within the given scope.
      jsx: (h, node) => {
        return Object.assign({}, node, {
          type: 'element',
          tagName: 'jsx',
          children: [{
            type: 'text',
            value: node.value
          }]
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

    return toHyper(el(scope), {
      type: 'element',
      tagName: 'div',
      properties: {},
      children: hast.children
    })
  }
}

module.exports = function (mdx, options = {}) {
  options.components = options.components || {}
  const plugins = options.plugins || []
  const compilers = options.compilers || []

  const { blocks } = getImports(mdx)
  options.blocks = blocks.concat(Object.keys(options.components))

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
