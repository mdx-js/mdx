const unified = require('unified')
const toMDAST = require('remark-parse')
const emoji = require('remark-emoji')
const squeeze = require('remark-squeeze-paragraphs')
const images = require('remark-images')
const toMDXAST = require('@mdx-js/mdxast')
const mdxToJsx = require('./mdx-to-jsx')
const hastToJsx = require('./hast-to-jsx')

module.exports = function(mdx, options = {}) {
  options.blocks = options.blocks || ['[a-z]+(\\.){0,1}[a-z]']
  const plugins = options.plugins || []
  const compilers = options.compilers || []

  const fn = unified()
    .use(toMDAST, options)
    .use(emoji, options)
    .use(images, options)
    .use(squeeze, options)
    .use(toMDXAST, options)

  plugins.forEach(plugins => fn.use(plugins, options))

  fn.use(mdxToJsx, options)

  compilers.forEach(compiler => fn.use(compiler, options))

  return fn.processSync(mdx).contents
}
