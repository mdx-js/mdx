const vfile = require('vfile')

const extract = require('../extract-imports-and-exports')
const fixtures = require('./fixtures/extract-imports-and-exports')

fixtures.forEach(fixture => {
  it(fixture.description, () => {
    const result = extract(
      fixture.mdx,
      vfile({path: '/test', content: 'testing'})
    )

    expect(result).toMatchSnapshot(fixture.result)
  })
})
