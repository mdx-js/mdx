const path = require('path')
const MDXAsset = require('../src/MDXAsset')

let value

describe('MDXAsset', async () => {
  beforeEach(async () => {
    const asset = new MDXAsset(path.resolve(__dirname, './Markdown.mdx'), {
      rootDir: __dirname
    })

    const processed = await asset.process()
    const jsx = processed.find(({ type }) => type === 'js')
    value = jsx.value
  })

  it('should render markdown with MDX.', () => {
    expect(value).toContain(
      '<MDXTag name="h1" components={components}>{`Test`}</MDXTag>'
    )
  })

  it('should render components with MDX.', () => {
    expect(value).toContain('<Component>component</Component>')
  })
})
