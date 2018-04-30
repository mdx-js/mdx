const unified = require('unified')
const toMDAST = require('remark-parse')
const squeeze = require('remark-squeeze-paragraphs')
const toMDXAST = require('@mdx-js/mdxast')
const mdxAstToMdxHast = require('./mdx-ast-to-mdx-hast')
const mdxHastToJsx = require('./mdx-hast-to-jsx')

function createMdxAstCompiler(options = {}) {
  const mdPlugins = options.mdPlugins || []

  options.blocks = options.blocks || ['[a-z]+(\\.){0,1}[a-z]']

  const fn = unified()
    .use(toMDAST, options)
    .use(squeeze, options)

  mdPlugins.forEach(plugin => fn.use(plugin, options))

  fn.use(toMDXAST, options).use(mdxAstToMdxHast, options)

  return fn
}

function applyHastPluginsAndCompilers(fn, options = {}) {
  const hastPlugins = options.hastPlugins || []
  const compilers = options.compilers || []

  hastPlugins.forEach(plugin => fn.use(plugin, options))

  fn.use(mdxHastToJsx, options)

  compilers.forEach(compiler => fn.use(compiler, options))
}

function createCompiler(options) {
  const compiler = createMdxAstCompiler(options)
  applyHastPluginsAndCompilers(compiler, options)

  return compiler
}

function sync(mdx, options) {
  const compiler = createCompiler(options)

  const { contents } = compiler.processSync(mdx)

  return contents
}

async function compile(mdx, options) {
  const compiler = createCompiler(options)

  const { contents } = await compiler.process(mdx)

  return contents
}

compile.sync = sync

module.exports = compile
exports = compile
exports.sync = sync
exports.createMdxAstCompiler = createMdxAstCompiler
exports.default = compile
