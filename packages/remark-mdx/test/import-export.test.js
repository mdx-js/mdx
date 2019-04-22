const vfile = require('vfile')

const {isImportOrExport} = require('..')
const extract = require('../extract-imports-and-exports')
const fixtures = require('./fixtures/import-export')

fixtures.forEach(fixture => {
  it(fixture.description, () => {
    const result = extract(
      fixture.mdx,
      vfile({path: '/test', content: 'testing'})
    )

    expect(result).toMatchSnapshot(fixture.result)
  })
})

const NOT_IMPORT_OR_EXPORT = ['importing', 'exporting', 'Import', 'Export']

NOT_IMPORT_OR_EXPORT.forEach(str => {
  it(`isImportOrExport returns false for "${str}"`, () => {
    const result = isImportOrExport(str)

    expect(result).toBeFalsy()
  })
})

const IMPORT_OR_EXPORT = ['import Foo from "bar"', 'export Foo']

IMPORT_OR_EXPORT.forEach(str => {
  it(`isImportOrExport returns true for "${str}"`, () => {
    const result = isImportOrExport(str)

    expect(result).toBeTruthy()
  })
})
