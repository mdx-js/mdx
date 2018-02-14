const { parse } = require('remark')
const select = require('unist-util-select')
const parseImports = require('parse-es6-imports')

const IMPORT_SELECTOR = 'paragraph > text:first-child[value^="import"]'

const importScope = (imports = []) =>
  imports.reduce((acc, curr) => {
    const scopedImports = curr
      .parsed
      .reduce((a, c) => {
        const i = c.namedImports.map(n => n.value)
        if (c.defaultImport) i.push(c.defaultImport)
        if (c.starImport) i.push(c.starImport)

        return a.concat(i)
      }, [])

    return acc.concat(scopedImports)
  }, [])

module.exports = mdx => {
  const imports = select(parse(mdx), IMPORT_SELECTOR)
    .map(i => {
      const squeezed = i.value.replace(/\s+/g, ' ')
      const parsed = parseImports(squeezed)

      return {
        raw: i.value,
        parsed
      }
    })

  return {
    imports,
    scope: importScope(imports)
  }
}
