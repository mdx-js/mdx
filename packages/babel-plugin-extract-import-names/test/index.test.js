const babel = require('@babel/core')

const BabelPluginExtractImportNames = require('..')

const transform = value => {
  const plugin = new BabelPluginExtractImportNames()

  babel.transformSync(value, {
    configFile: false,
    plugins: [plugin.plugin]
  })

  return plugin.state.names
}

describe('babel-plugin-extract-import-names', () => {
  test('should capture an empty list on an empty file', () => {
    expect(transform('')).toEqual([])
  })

  test('should capture an empty list if nothing is imported', () => {
    expect(transform('console.log(1)')).toEqual([])
  })

  test('should capture an a default import', () => {
    expect(transform('import name1 from "m"')).toEqual(['name1'])
  })

  test('should capture whole', () => {
    expect(transform('import * as name1 from "m"')).toEqual(['name1'])
  })

  test('should capture a destructuring', () => {
    expect(transform('import {name1} from "m"')).toEqual(['name1'])
  })

  test('should capture a destructuring w/ rename', () => {
    expect(transform('import {x as name1} from "m"')).toEqual(['name1'])
  })

  test('should capture default and destructuring', () => {
    expect(transform('import name1, {x as name2} from "m"')).toEqual([
      'name1',
      'name2'
    ])
  })

  test('should capture default and whole', () => {
    expect(transform('import name1, * as name2 from "m"')).toEqual([
      'name1',
      'name2'
    ])
  })

  test('should not capture an import for side-effects', () => {
    expect(transform('import "m"')).toEqual([])
  })

  test('should not capture an import-as-function', () => {
    expect(transform('import("m")')).toEqual([])
  })
})
