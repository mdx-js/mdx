const unified = require('unified')
const babylon = require('babylon')
const remark = require('remark-parse')
const rehype = require('remark-rehype')
const html = require('rehype-stringify')
const visit = require('unist-util-visit')

const blocks = require('remark-parse/lib/block-elements.json')

const jsx = options => tree =>
  visit(tree, 'html', (node, i, parent) => {
    const ast = babylon.parse(node.value, {
      sourceType: 'module',
      plugins: [
        'jsx'
      ]
    })

    node.type = 'jsx'
    console.log(ast)
  })

module.exports = (mdx, options = {}) => {
  options.components = options.components || {}
  options.blocks = Object.keys(options.components).concat(blocks)

  const fn = unified()
    .use(remark, options)
    .use(jsx, options)
    .use(rehype)
    .use(html)

  return fn.processSync(mdx)
}
