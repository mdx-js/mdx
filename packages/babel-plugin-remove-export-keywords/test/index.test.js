const {test} = require('uvu')
const assert = require('uvu/assert')
const babel = require('@babel/core')

const plugin = require('..')

const transform = value => {
  const result = babel.transformSync(value, {
    configFile: false,
    plugins: [plugin]
  })

  return result.code
}

test('should support an empty file', () => {
  assert.equal(transform(''), '')
})

test('should not do anything if nothing is exported', () => {
  assert.equal(transform('console.log(1)'), 'console.log(1);')
})

test('should remove export on `const`, `let`, and `var`', () => {
  const list = ['var', 'let', 'const']
  const expected = ['name1', 'name2', 'name3']
  assert.equal(
    transform(list.map((d, i) => `export ${d} ${expected[i]} = ""`).join('\n')),
    list.map((d, i) => `${d} ${expected[i]} = "";`).join('\n')
  )
})

test('should support multiple exports with commas', () => {
  assert.equal(transform('export var name1, name2'), 'var name1, name2;')
})

test('should support multiple exports with commas and assignments', () => {
  assert.equal(
    transform('export var name1 = "a", name2 = "b"'),
    'var name1 = "a",\n    name2 = "b";'
  )
})

test('should support a named function', () => {
  assert.equal(transform('export function name1() {}'), 'function name1() {}')
})

test('should support a class', () => {
  assert.equal(transform('export class name1 {}'), 'class name1 {}')
})

test('should *not* support a list', () => {
  assert.equal(
    transform('var name1 = "a", name2 = "b"; export {name1, name2}'),
    'var name1 = "a",\n    name2 = "b";\nexport { name1, name2 };'
  )
})

test('should *not* support renames', () => {
  assert.equal(
    transform(
      'var name1 = "a", name2 = "b"; export {name1 as foo, name2 as bar}'
    ),
    'var name1 = "a",\n    name2 = "b";\nexport { name1 as foo, name2 as bar };'
  )
})

test('should support object destructuring', () => {
  assert.equal(transform('export var {name1} = {}'), 'var {\n  name1\n} = {};')
})

test('should support object destructuring w/ rename', () => {
  assert.equal(
    transform('export var {name1: bar} = {}'),
    'var {\n  name1: bar\n} = {};'
  )
})

test('should support array destructuring', () => {
  assert.equal(transform('export var [name1] = []'), 'var [name1] = [];')
})

test.run()
