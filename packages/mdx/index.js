const unified = require('unified')
const toMDAST = require('remark-parse')
const squeeze = require('remark-squeeze-paragraphs')
const mdxAstToMdxHast = require('./mdx-ast-to-mdx-hast')
const mdxHastToJsx = require('./mdx-hast-to-jsx')

const DEFAULT_OPTIONS = {
  footnotes: true,
  mdPlugins: [],
  hastPlugins: [],
  compilers: [],
  blocks: [BLOCKS_REGEX]
}

const BLOCKS_REGEX = '[a-z\\.]+(\\.){0,1}[a-z\\.]'
const IMPORT_REGEX = /^import/
const EXPORT_REGEX = /^export/
const EXPORT_DEFAULT_REGEX = /^export default/
const isImport = text => IMPORT_REGEX.test(text)
const isExport = text => EXPORT_REGEX.test(text)
const isExportDefault = text => EXPORT_DEFAULT_REGEX.test(text)

const locateImport = (value, fromIndex) =>
  fromIndex !== 1 || !isImport(value) ? -1 : 1

function tokenizeImports(eat, value) {
  if (isImport(value)) {
    return eat(value)({ type: 'html', value })
  }
}

tokenizeImports.locator = locateImport
tokenizeImports.notInBlock = true
tokenizeImports.notInLink = true
tokenizeImports.notInList = true

const locateExport = (value, fromIndex) =>
  fromIndex !== 1 || !isExport(value) ? -1 : 1

function tokenizeExports(eat, value, silent) {
  if (isExport(value)) {
    return eat(value)({
      type: 'html',
      default: isExportDefault(value),
      value
    })

    return ret
  }
}

tokenizeExports.locator = locateExport
tokenizeExports.notInBlock = true
tokenizeExports.notInLink = true
tokenizeExports.notInList = true

function esSyntax() {
  var Parser = this.Parser
  var tokenizers = Parser.prototype.inlineTokenizers
  var methods = Parser.prototype.inlineMethods

  tokenizers.imports = tokenizeImports
  tokenizers.exports = tokenizeExports

  methods.splice(methods.indexOf('text'), 0, 'imports')
  methods.splice(methods.indexOf('text'), 0, 'exports')
}

function createMdxAstCompiler(options) {
  const mdPlugins = options.mdPlugins

  const fn = unified()
    .use(toMDAST, options)
    .use(esSyntax)
    .use(squeeze, options)

  mdPlugins.forEach(plugin => fn.use(plugin, options))

  fn.use(mdxAstToMdxHast, options)

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
