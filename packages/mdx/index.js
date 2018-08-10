const unified = require('unified')
const toMDAST = require('remark-parse')
const squeeze = require('remark-squeeze-paragraphs')

const toMDXAST = require('./lib/mdast-to-mdxast')
const mdxAstToMdxHast = require('./lib/mdxast-to-mdxhast')
const mdxHastToJsx = require('./lib/mdxhast-to-jsx')
const esSyntax = require('./lib/tokenizer')

const { BLOCKS_REGEX } = require('./lib/util')

const DEFAULT_OPTIONS = {
  footnotes: true,
  mdPlugins: [],
  hastPlugins: [],
  compilers: [],
  blocks: [BLOCKS_REGEX]
}

function createMdxAstCompiler(options) {
  const mdPlugins = options.mdPlugins

  const fn = unified()
    .use(toMDAST, options)
    .use(esSyntax)
    .use(squeeze, options)

  mdPlugins.forEach(plugin => {
    // handle [plugin, pluginOptions] syntax
    if (Array.isArray(plugin) && plugin.length > 1) {
      fn.use(plugin[0], plugin[1])
    } else {
      fn.use(plugin, options)
    }
  })

  fn.use(toMDXAST, options).use(mdxAstToMdxHast, options)

  return fn
}

function applyHastPluginsAndCompilers(compiler, options) {
  const hastPlugins = options.hastPlugins
  const compilers = options.compilers

  hastPlugins.forEach(plugin => {
    // handle [plugin, pluginOptions] syntax
    if (Array.isArray(plugin) && plugin.length > 1) {
      compiler.use(plugin[0], plugin[1])
    } else {
      compiler.use(plugin, options)
    }
  })

  compiler.use(mdxHastToJsx, options)

  for (const compilerPlugin of compilers) {
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
