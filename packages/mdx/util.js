const IMPORT_REGEX = /^import/
const EXPORT_REGEX = /^export/
const EXPORT_DEFAULT_REGEX = /^export default/
const BLOCKS_REGEX = '[a-z\\.]+(\\.){0,1}[a-z\\.]'
const EMPTY_NEWLINE = '\n\n'

const paramCase = string =>
  string
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([a-z])([0-9])/g, '$1-$2')
    .toLowerCase()

const toTemplateLiteral = text => {
  const escaped = text
    .replace(/\\/g, '\\\\') // Escape all "\" to avoid unwanted escaping in text nodes
    .replace(/`/g, '\\`') // Escape "`"" since
    .replace(/\$\{/g, '\\${') // Escape ${} in text so that it doesn't eval

  return '{`' + escaped + '`}'
}

module.exports.EMPTY_NEWLINE = EMPTY_NEWLINE
module.exports.BLOCKS_REGEX = BLOCKS_REGEX
module.exports.isImport = text => IMPORT_REGEX.test(text)
module.exports.isExport = text => EXPORT_REGEX.test(text)
module.exports.isExportDefault = text => EXPORT_DEFAULT_REGEX.test(text)
module.exports.paramCase = paramCase
module.exports.toTemplateLiteral = toTemplateLiteral
