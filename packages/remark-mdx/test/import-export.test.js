const extract = require('../extract-imports-and-exports')
const fixtures = require('./fixtures/import-export')

fixtures.forEach(fixture => {
  it(fixture.description, () => {
    const result = extract(fixture.mdx)

    expect(result).toMatchSnapshot(fixture.result)
  })
})
