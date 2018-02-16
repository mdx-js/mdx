const unified = require('unified')
const toMDAST = require('remark-parse')
const emoji = require('remark-emoji')
const squeeze = require('remark-squeeze-paragraphs')
const toc = require('remark-toc')
const frontmatter = require('remark-frontmatter')
const visit = require('unist-util-visit')
const toMDXAST = require('to-mdxast')
const { getImports } = require('to-mdxast')
const toHAST = require('mdast-util-to-hast')
const toHyper = require('hast-to-hyperscript')

module.exports = (mdx, options = {}) => {
  const components = options.components || {}
  const { blocks } = getImports(mdx)

  options.blocks = blocks.concat(Object.keys(components))

  const fn = unified()
    .use(toMDAST, options)
    .use(emoji, options)
    .use(frontmatter, { type: 'yaml', marker: '-' })
    .use(squeeze, options)
    .use(toMDXAST, options)
    .use(renderer, options)

  return fn.processSync(mdx)
}
