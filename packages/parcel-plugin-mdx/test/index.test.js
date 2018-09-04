const path = require('path')
const index = require('../src')
const MDXAsset = require('../src/MDXAsset')

let value

describe('index', () => {
  it('should add asset types', () => {
    const bundler = { addAssetType: jest.fn() }
    const { calls } = bundler.addAssetType.mock
    const mdxAssetPath = require.resolve('../src/MDXAsset')

    index(bundler)

    expect(calls.length).toEqual(2)
    expect(calls[0][0]).toBe('md')
    expect(calls[0][1]).toBe(mdxAssetPath)
    expect(calls[1][0]).toEqual('mdx')
    expect(calls[1][1]).toEqual(mdxAssetPath)
  })
})

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
