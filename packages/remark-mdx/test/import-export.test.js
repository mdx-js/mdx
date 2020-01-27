const vfile = require('vfile')

const extract = require('../extract-imports-and-exports')
const fixtures = require('./fixtures/import-export')

fixtures.forEach(fixture => {
  it(fixture.description, () => {
    const result = extract(
      fixture.mdx,
      vfile({path: '/test', content: 'testing'})
    )

    expect(result).toMatchSnapshot()
  })
})
