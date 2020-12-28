const path = require('path')
const plugin = require('..')
const MDXAsset = require('../src/MDXAsset')

describe('index', () => {
  it('should add asset type', () => {
    const bundler = {addAssetType: jest.fn()}
    const {calls} = bundler.addAssetType.mock
    const mdxAssetPath = require.resolve('../src/MDXAsset')
    plugin(bundler)
    expect(calls.length).toEqual(1)
    expect(calls[0][0]).toBe('mdx')
    expect(calls[0][1]).toBe(mdxAssetPath)
  })
})

describe('MDXAsset', () => {
  it('should work', async () => {
    const asset = new MDXAsset(path.resolve(__dirname, './Content.mdx'), {
      rootDir: __dirname
    })

    const results = await asset.process()
    const result = results[0]

    expect(result.value).toContain('mdx("h1", null, "Test")')

    expect(result.value).toContain('mdx(Component')
  })
})
