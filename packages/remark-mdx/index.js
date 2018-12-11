const IMPORT_REGEX = /^import/
const EXPORT_REGEX = /^export/
const EXPORT_DEFAULT_REGEX = /^export default/
const EMPTY_NEWLINE = '\n\n'

const isImport = text => IMPORT_REGEX.test(text)
const isExport = text => EXPORT_REGEX.test(text)
const isExportDefault = text => EXPORT_DEFAULT_REGEX.test(text)

module.exports = mdx

mdx.default = mdx

tokenizeEsSyntax.locator = tokenizeEsSyntaxLocator

function mdx(_options) {
  const parser = this.Parser
  const compiler = this.Compiler

  if (parser && parser.prototype && parser.prototype.blockTokenizers) {
    attachParser(parser)
  }

  if (compiler && compiler.prototype && compiler.prototype.visitors) {
    attachCompiler(compiler)
  }
}

function attachParser(parser) {
  const blocks = parser.prototype.blockTokenizers
  const inlines = parser.prototype.inlineTokenizers
  const methods = parser.prototype.blockMethods

  blocks.esSyntax = tokenizeEsSyntax
  blocks.html = wrap(blocks.html)
  inlines.html = wrap(inlines.html)

  methods.splice(methods.indexOf('paragraph'), 0, 'esSyntax')

  function wrap(original) {
    tokenizeJsx.locator = original.locator

    return tokenizeJsx

    function tokenizeJsx() {
      const node = original.apply(this, arguments)

      if (node) {
        node.type = 'jsx'
      }

      return node
    }
  }
}

function attachCompiler(compiler) {
  const proto = compiler.prototype

  proto.visitors = Object.assign({}, proto.visitors, {
    import: stringifyEsSyntax,
    export: stringifyEsSyntax,
    jsx: proto.visitors.html
  })
}

function stringifyEsSyntax(node) {
  return node.value
}

function tokenizeEsSyntax(eat, value) {
  const index = value.indexOf(EMPTY_NEWLINE)
  const subvalue = index !== -1 ? value.slice(0, index) : value

  if (isExport(subvalue)) {
    return eat(subvalue)({
      type: 'export',
      default: isExportDefault(subvalue),
      value: subvalue
    })
  }

  if (isImport(subvalue)) {
    return eat(subvalue)({
      type: 'import',
      value: subvalue
    })
  }
}

function tokenizeEsSyntaxLocator(value, _fromIndex) {
  return isExport(value) || isImport(value) ? -1 : 1
}
