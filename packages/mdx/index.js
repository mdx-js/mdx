const unified = require('unified')
const toMDAST = require('remark-parse')
const squeeze = require('remark-squeeze-paragraphs')
const images = require('remark-images')
const toMDXAST = require('@mdx-js/mdxast')
const mdxAstToMdxHast = require('./mdx-ast-to-mdx-hast')
const mdxHastToJsx = require('./mdx-hast-to-jsx')

function createMdxAstCompiler(options = {}) {
  options.blocks = options.blocks || ['[a-z]+(\\.){0,1}[a-z]']
  const fn = unified()
    .use(toMDAST, options)
    .use(images, options)
    .use(squeeze, options)
    .use(toMDXAST, options)
    .use(mdxAstToMdxHast, options)

  return fn
}

function compile(mdx, options = {}) {
  const plugins = options.plugins || []
  const compilers = options.compilers || []

  const fn = createMdxAstCompiler(options)

  plugins.forEach(plugins => fn.use(plugins, options))

  fn.use(mdxHastToJsx, options)

  compilers.forEach(compiler => fn.use(compiler, options))

  return fn.processSync(mdx).contents
}

module.exports = compile
exports = compile
exports.createMdxAstCompiler = createMdxAstCompiler
exports.default = compile
