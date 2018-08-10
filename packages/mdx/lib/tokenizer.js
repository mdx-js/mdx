const {
  isImport,
  isExport,
  isExportDefault,
  EMPTY_NEWLINE
} = require('./util')

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

module.exports = function esSyntax() {
  const Parser = this.Parser
  const tokenizers = Parser.prototype.blockTokenizers
  const methods = Parser.prototype.blockMethods

  tokenizers.esSyntax = tokenizeEsSyntax

  methods.splice(methods.indexOf('paragraph'), 0, 'esSyntax')
}
