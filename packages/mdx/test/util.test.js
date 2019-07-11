const {paramCase} = require('../util')

const PARAM_CASE_FIXTURES = [
  ['ariaHidden', 'aria-hidden'],
  ['data123', 'data-123']
]

PARAM_CASE_FIXTURES.forEach(([input, expected]) => {
  test(`it turns ${input} into ${expected}`, () => {
    const result = paramCase(input)

    expect(result).toEqual(expected)
  })
})
