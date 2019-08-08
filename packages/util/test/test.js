const {paramCase, isImportOrExport} = require('..')

const PARAM_CASE_FIXTURES = [
  ['ariaHidden', 'aria-hidden'],
  ['data123', 'data-123']
]

describe('paramCase', () => {
  PARAM_CASE_FIXTURES.forEach(([input, expected]) => {
    test(`it turns ${input} into ${expected}`, () => {
      const result = paramCase(input)

      expect(result).toEqual(expected)
    })
  })
})

const NOT_IMPORT_OR_EXPORT = ['importing', 'exporting', 'Import', 'Export']
const IMPORT_OR_EXPORT = ['import Foo from "bar"', 'export Foo']

describe('isImportOrExport', () => {
  NOT_IMPORT_OR_EXPORT.forEach(str => {
    it(`returns false for "${str}"`, () => {
      const result = isImportOrExport(str)

      expect(result).toBeFalsy()
    })
  })

  IMPORT_OR_EXPORT.forEach(str => {
    it(`returns true for "${str}"`, () => {
      const result = isImportOrExport(str)

      expect(result).toBeTruthy()
    })
  })
})
