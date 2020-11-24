const extractImportsAndExports = require('./extract-imports-and-exports')

module.exports = mdxjs
mdxjs.default = mdxjs

tokenizeEsSyntax.notInBlock = true

function mdxjs() {
  const parser = this.Parser
  const compiler = this.Compiler

  // If `remark-parse` seems to be attached.
  if (parser && parser.prototype && parser.prototype.blockTokenizers) {
    attachParser(parser)
  }

  // If `remark-stringify` seems to be attached.
  if (compiler && compiler.prototype && compiler.prototype.visitors) {
    attachCompiler(compiler)
  }
}

function attachParser(parser) {
  const blocks = parser.prototype.blockTokenizers
  const methods = parser.prototype.blockMethods

  blocks.esSyntax = tokenizeEsSyntax

  methods.splice(methods.indexOf('paragraph'), 0, 'esSyntax')
}

function attachCompiler(compiler) {
  const proto = compiler.prototype

  proto.visitors = Object.assign({}, proto.visitors, {
    import: stringifyEsSyntax,
    export: stringifyEsSyntax
  })
}

function stringifyEsSyntax(node) {
  return node.value.trim()
}

function tokenizeEsSyntax(eat, value) {
  const index = value.indexOf('\n\n')
  const subvalue = index !== -1 ? value.slice(0, index) : value

  if (/^(export|import)\s/.test(value)) {
    const nodes = extractImportsAndExports(subvalue, this.file)
    nodes.map(node => eat(node.value)(node))
  }
}
