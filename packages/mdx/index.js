const unified = require('unified')
const toMDAST = require('remark-parse')
const squeeze = require('remark-squeeze-paragraphs')
const toMDXAST = require('./md-ast-to-mdx-ast')
const mdxAstToMdxHast = require('./mdx-ast-to-mdx-hast')
const mdxHastToJsx = require('./mdx-hast-to-jsx')

const {
  isImport,
  isExport,
  isExportDefault,
  BLOCKS_REGEX,
  EMPTY_NEWLINE
} = require('./util')

const DEFAULT_OPTIONS = {
  footnotes: true,
  mdPlugins: [],
  hastPlugins: [],
  compilers: [],
  blocks: [BLOCKS_REGEX]
}

const tokenizeEsSyntax = (eat, value) => {
  const index = value.indexOf(EMPTY_NEWLINE)
  const subvalue = value.slice(0, index)

  if (isExport(subvalue) || isImport(subvalue)) {
    return eat(subvalue)({
      type: isExport(subvalue) ? 'export' : 'import',
      default: isExportDefault(subvalue),
      value: subvalue
    })
  }
}

tokenizeEsSyntax.locator = (value, fromIndex) => {
  return isExport(value) || isImport(value) ? -1 : 1
}

function esSyntax() {
  var Parser = this.Parser
  var tokenizers = Parser.prototype.blockTokenizers
  var methods = Parser.prototype.blockMethods

  tokenizers.esSyntax = tokenizeEsSyntax

  methods.splice(methods.indexOf('paragraph'), 0, 'esSyntax')
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
