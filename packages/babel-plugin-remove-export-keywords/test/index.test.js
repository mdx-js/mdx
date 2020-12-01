const babel = require('@babel/core')

const plugin = require('..')

const transform = value => {
  const result = babel.transformSync(value, {
    configFile: false,
    plugins: [plugin]
  })

  return result.code
}

describe('babel-plugin-remove-export-keywords', () => {
  test('should support an empty file', () => {
    expect(transform('')).toEqual('')
  })

  test('should not do anything if nothing is exported', () => {
    expect(transform('console.log(1)')).toEqual('console.log(1);')
  })

  test('should remove export on `const`, `let`, and `var`', () => {
    const list = ['var', 'let', 'const']
    const expected = ['name1', 'name2', 'name3']
    expect(
      transform(
        list.map((d, i) => `export ${d} ${expected[i]} = ""`).join('\n')
      )
    ).toEqual(list.map((d, i) => `${d} ${expected[i]} = "";`).join('\n'))
  })

  test('should support multiple exports with commas', () => {
    expect(transform('export var name1, name2')).toEqual('var name1, name2;')
  })

  test('should support multiple exports with commas and assignments', () => {
    expect(transform('export var name1 = "a", name2 = "b"')).toEqual(
      'var name1 = "a",\n    name2 = "b";'
    )
  })

  test('should support a named function', () => {
    expect(transform('export function name1() {}')).toEqual(
      'function name1() {}'
    )
  })

  test('should support a class', () => {
    expect(transform('export class name1 {}')).toEqual('class name1 {}')
  })

  test('should *not* support a list', () => {
    expect(
      transform('var name1 = "a", name2 = "b"; export {name1, name2}')
    ).toEqual('var name1 = "a",\n    name2 = "b";\nexport { name1, name2 };')
  })

  test('should *not* support renames', () => {
    expect(
      transform(
        'var name1 = "a", name2 = "b"; export {name1 as foo, name2 as bar}'
      )
    ).toEqual(
      'var name1 = "a",\n    name2 = "b";\nexport { name1 as foo, name2 as bar };'
    )
  })

  test('should support object destructuring', () => {
    expect(transform('export var {name1} = {}')).toEqual(
      'var {\n  name1\n} = {};'
    )
  })

  test('should support object destructuring w/ rename', () => {
    expect(transform('export var {name1: bar} = {}')).toEqual(
      'var {\n  name1: bar\n} = {};'
    )
  })

  test('should support array destructuring', () => {
    expect(transform('export var [name1] = []')).toEqual('var [name1] = [];')
  })
})
