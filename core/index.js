const unified = require('unified')
const toMDAST = require('remark-parse')
const emoji = require('remark-emoji')
const squeeze = require('remark-squeeze-paragraphs')
const toc = require('remark-toc')
const matter = require('remark-frontmatter')
const visit = require('unist-util-visit')
const toMDXAST = require('to-mdxast')
const toHAST = require('mdast-util-to-hast')
const toHyper = require('hast-to-hyperscript')
const toElement = require('to-element')
const yaml = require('js-yaml')

const { getImports } = require('to-mdxast')
const { createElement } = require('react')

const jsx = (scope, components) => (h, node) => {
  const element = toElement(node.value, scope)
  const props = element.props

  node.element = element

  if (Array.isArray(props.children)) {
    const children = props.children.map(c => {
      if (typeof c === 'string') {
        return {
          type: 'text',
          value: c
        }
      }

      const name = c.type && c.type.name

      return h(
        node,
        components[name] || name,
        c.props,
        c.props.children
      )
    })

    return h(node, 'div', props, children)
  }

  return h(node, 'React.Fragment', props)
}

function renderer (options) {
  const components = options.components

  const el = (name, props = {}, children) => {
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

    const hast = toHAST(node, {
      handlers: {
        jsx: jsx(scope, components)
      }
    })

    return toHyper(createElement, hast)
  }
}

module.exports = (mdx, options = {}) => {
  options.components = options.components || {}

  const { blocks } = getImports(mdx)
  options.blocks = blocks.concat(Object.keys(options.components))

  const fn = unified()
    .use(toMDAST, options)
    .use(emoji, options)
    .use(matter, { type: 'yaml', marker: '-' })
    .use(squeeze, options)
    .use(toMDXAST, options)
    .use(renderer, options)

  return fn.processSync(mdx).contents
}
