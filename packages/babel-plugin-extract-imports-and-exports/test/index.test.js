const vfile = require('vfile')

const extract = require('../')
const fixtures = require('./fixtures/')

fixtures.forEach(fixture => {
  it(fixture.description, () => {
    const result = extract(
      fixture.mdx,
      vfile({path: '/test', content: 'testing'})
    )

    expect(result).toMatchSnapshot(fixture.result)
  })
})
