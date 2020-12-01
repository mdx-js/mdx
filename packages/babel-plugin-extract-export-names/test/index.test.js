const babel = require('@babel/core')

const BabelPluginExtractExportNames = require('..')

const transform = value => {
  const plugin = new BabelPluginExtractExportNames()

  babel.transformSync(value, {configFile: false, plugins: [plugin.plugin]})

  return plugin.state.names
}

describe('babel-plugin-extract-export-names', () => {
  test('should capture an empty list on an empty file', () => {
    expect(transform('')).toEqual([])
  })

  test('should capture an empty list if nothing is exported', () => {
    expect(transform('console.log(1)')).toEqual([])
  })

  test('should capture `const`, `let`, and `var`', () => {
    const list = ['var', 'let', 'const']
    const expected = ['name1', 'name2', 'name3']
    const input = list
      .map((d, i) => `export ${d} ${expected[i]} = ""`)
      .join('\n')
    expect(transform(input)).toEqual(expected)
  })

  test('should capture multiple exports with commas', () => {
    expect(
      transform('var name1 = "a", name2 = "b"; export var name1, name2')
    ).toEqual(['name1', 'name2'])
  })

  test('should capture multiple exports with commas and assignments', () => {
    expect(transform('export var name1 = "a", name2 = "b"')).toEqual([
      'name1',
      'name2'
    ])
  })

  // To do: should be added.
  test('should *not* capture a named function', () => {
    expect(transform('export function name1() {}')).toEqual([])
  })

  // To do: should be added.
  test('should *not* capture a class', () => {
    expect(transform('export class name1 {}')).toEqual([])
  })

  test('should capture a list', () => {
    expect(
      transform('var name1 = "a", name2 = "b"; export {name1, name2}')
    ).toEqual(['name1', 'name2'])
  })

  // To do: is this correct?
  test('should capture renames', () => {
    expect(
      transform(
        'var name1 = "a", name2 = "b"; export {name1 as foo, name2 as bar}'
      )
    ).toEqual(['name1', 'name2'])
  })

  test('should capture object destructuring', () => {
    expect(transform('export var {name1} = {}')).toEqual(['name1'])
  })

  // To do: is this correct?
  test('should capture object destructuring w/ rename', () => {
    expect(transform('export var {name1: bar} = {}')).toEqual(['name1'])
  })

  test('should capture array destructuring', () => {
    expect(transform('export var [name1] = []')).toEqual(['name1'])
  })

  test('should capture an expression as a default export', () => {
    expect(
      transform('function name1() {}; export { name1 as default }')
    ).toEqual(['name1'])
  })

  // To do: should be added.
  test('should *not* capture an expression as default export', () => {
    expect(transform('let name1; export default name1 = 12;')).toEqual([])
  })

  // To do: should be added.
  test('should *not* capture a class as a default export', () => {
    expect(transform('export default class name1 {}')).toEqual([])
  })

  // To do: should be added.
  test('should *not* capture a function as a default export', () => {
    expect(transform('export default function name1() {}')).toEqual([])
  })

  // To do: should be added?
  test('should *not* capture aggregates', () => {
    expect(transform('export * from "..."')).toEqual([])
  })

  // To do: should be added? (Draft ECMAScript® 2O21)
  test('should *not* capture reexported as a whole', () => {
    expect(transform('export * as name1 from "..."')).toEqual([])
  })

  test('should capture reexported destructuring', () => {
    expect(transform('export {name1} from "..."')).toEqual(['name1'])
  })

  test('should capture reexported destructuring', () => {
    expect(transform('export {name1} from "..."')).toEqual(['name1'])
  })

  // To do: is this correct?
  test('should capture reexported destructuring w/ renames', () => {
    expect(transform('export {name1 as foo} from "..."')).toEqual(['name1'])
  })

  // To do: is this correct?
  test('should capture reexported as a default whole', () => {
    expect(transform('export {default} from "..."')).toEqual(['default'])
  })

  // To do: is this correct?
  test('should capture reexported default and non-default', () => {
    expect(transform('export {default as name1, name2} from "..."')).toEqual([
      'default',
      'name2'
    ])
  })
})
