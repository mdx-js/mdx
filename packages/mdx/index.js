const unified = require('unified')
const toMDAST = require('remark-parse')
const squeeze = require('remark-squeeze-paragraphs')
const toMDXAST = require('@mdx-js/mdxast')
const mdxAstToMdxHast = require('./mdx-ast-to-mdx-hast')
const mdxHastToJsx = require('./mdx-hast-to-jsx')

const BLOCKS_REGEX = '[a-z\\.]+(\\.){0,1}[a-z\\.]'
const DEFAULT_OPTIONS = {
  footnotes: true,
  mdPlugins: [],
  hastPlugins: [],
  compilers: [],
  blocks: [BLOCKS_REGEX]
}

function createMdxAstCompiler(options) {
  const mdPlugins = options.mdPlugins

  options.blocks = options.blocks

  const fn = unified()
    .use(toMDAST, options)
    .use(squeeze, options)

  mdPlugins.forEach(plugin => fn.use(plugin, options))

  fn.use(toMDXAST, options).use(mdxAstToMdxHast, options)

  return fn
}

function applyHastPluginsAndCompilers(compiler, options) {
  const hastPlugins = options.hastPlugins
  const compilers = options.compilers

  for(const hastPlugin of hastPlugins) {
    compiler.use(hastPlugin, options)
  }

  compiler.use(mdxHastToJsx, options)

  for(const compilerPlugin of compilers) {
    compiler.use(compilerPlugin, options)
  }

  return compiler
}

function createCompiler(options) {
  const compiler = createMdxAstCompiler(options)
  const compilerWithPlugins = applyHastPluginsAndCompilers(compiler, options)

  return compilerWithPlugins
}

function sync(mdx, options) {
  const opts = Object.assign({}, DEFAULT_OPTIONS, options)
  const compiler = createCompiler(opts)

  const { contents } = compiler.processSync(mdx)

  return contents
}

async function compile(mdx, options = {}) {
  const opts = Object.assign({}, DEFAULT_OPTIONS, options)
  const compiler = createCompiler(opts)

  const { contents } = await compiler.process(mdx)

  return contents
}

compile.sync = sync

module.exports = compile
exports = compile
exports.sync = sync
exports.createMdxAstCompiler = createMdxAstCompiler
exports.default = compile
