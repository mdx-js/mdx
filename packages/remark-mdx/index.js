const isAlphabetical = require('is-alphabetical')
const extractImportsAndExports = require('./extract-imports-and-exports')
const block = require('./block')
const {tag} = require('./tag')

const IMPORT_REGEX = /^import/
const EXPORT_REGEX = /^export/
const EMPTY_NEWLINE = '\n\n'
const LESS_THAN = '<'
const GREATER_THAN = '>'
const SLASH = '/'
const EXCLAMATION = '!'

const isImport = text => IMPORT_REGEX.test(text)
const isExport = text => EXPORT_REGEX.test(text)

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
  blocks.html = wrap(block)
  inlines.html = wrap(inlines.html, inlineJsx)

  methods.splice(methods.indexOf('paragraph'), 0, 'esSyntax')

  function wrap(original, customTokenizer) {
    const tokenizer = customTokenizer || tokenizeJsx
    tokenizer.locator = original.locator

    return tokenizer

    function tokenizeJsx() {
      const node = original.apply(this, arguments)

      if (node) {
        node.type = 'jsx'
      }

      return node
    }
  }

  function inlineJsx(eat, value) {
    if (value.charAt(0) !== LESS_THAN) {
      return
    }

    const nextChar = value.charAt(1)
    if (
      nextChar !== GREATER_THAN &&
      nextChar !== SLASH &&
      nextChar !== EXCLAMATION &&
      !isAlphabetical(nextChar)
    ) {
      return
    }

    const subvalueMatches = value.match(tag)
    if (!subvalueMatches) {
      return
    }

    const subvalue = subvalueMatches[0]
    return eat(subvalue)({type: 'jsx', value: subvalue})
  }
}

function attachCompiler(compiler) {
  const proto = compiler.prototype

  proto.visitors = Object.assign({}, proto.visitors, {
    import: stringifyEsSyntax,
    export: stringifyEsSyntax,
    jsx: stringifyEsSyntax
  })
}

function stringifyEsSyntax(node) {
  return node.value.trim()
}

function tokenizeEsSyntax(eat, value) {
  const index = value.indexOf(EMPTY_NEWLINE)
  const subvalue = index !== -1 ? value.slice(0, index) : value

  if (isExport(subvalue) || isImport(subvalue)) {
    const nodes = extractImportsAndExports(subvalue, this.file)
    nodes.map(node => eat(node.value)(node))
  }
}

function tokenizeEsSyntaxLocator(value, _fromIndex) {
  return isExport(value) || isImport(value) ? -1 : 1
}
