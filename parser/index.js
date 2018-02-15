const unified = require('unified')
const remark = require('remark-parse')
const rehype = require('remark-rehype')
const matter = require('remark-frontmatter')
const html = require('rehype-stringify')
const visit = require('unist-util-visit')
const blocks = require('remark-parse/lib/block-elements.json')

const getImports = require('./get-imports')
const parseImports = require('./parse-imports')
const parseJSX = require('./parse-jsx')

const gatherText = node => {
  const children = (node.children || []).map(gatherText)
  return [node.value]
    .concat(children)
    .join('')
}

const fromBabelAST = (node, options) => {
  if (node.type === 'JSXText') {
    return {
      type: 'text',
      value: node.value
    }
  } else if (node.type === 'JSXElement') {
    const tagName = node.openingElement.name.name

    return {
      tagName,
      type: 'element',
      properties: node.openingElement.attributes.reduce((acc, curr) => {
        const name = curr.name.name
        const value = curr.value.value

        return Object.assign(acc, { [name]: value })
      }, {}),
      children: node.children.map(c => fromBabelAST(c, options)).filter(Boolean)
    }
  } else {
    return
  }
}

const jsx = options => tree =>
  visit(tree, 'html', (node, i, parent) => {
    try {
      const ast = parseJSX(node.value).program.body[0].expression
      node.type = 'jsx'
      node.children = fromBabelAST(ast, options)
      //console.log(JSON.stringify(node, null, 2))
    } catch (e) {
      const position = [
        node.position.start.line,
        node.position.start.column
      ].join(':')

      throw new Error(
        [
          `[${position}]: Syntax Error - Could not parse JSX block`,
          node.value,
          ''
        ].join('\n\n')
      )
    }
  })

const parse = (mdx, options = {}) => {
  options.components = options.components || {}

  // TODO: Need to figure out a better way to handle imports
  // parsing. As implemented it parses the whole thing :(
  options.blocks = Object
    .keys(options.components)
    .concat(getImports(mdx).scope)
    .concat(blocks)

  const fn = unified()
    .use(remark, options)
    .use(matter, { type: 'yaml', marker: '-' })
    .use(parseImports, options)
    .use(jsx, options)
    .use(rehype)
    .use(html)

  return fn.processSync(mdx)
}

module.exports = parse
