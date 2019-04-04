const extract = require('../extract-imports-and-exports')
const fixtures = require('./fixtures/import-export')
const vfile = require('vfile')

fixtures.forEach(fixture => {
  it(fixture.description, () => {
    const result = extract(
      fixture.mdx,
      vfile({path: '/test', content: 'testing'})
    )

    expect(result).toMatchSnapshot(fixture.result)
  })
})
