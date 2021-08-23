import {jest} from '@jest/globals'
import {createRequire} from 'module'
import {fileURLToPath} from 'url'
import plugin from '..'
import MDXAsset from '../src/MDXAsset'

describe('index', () => {
  it('should add asset type', () => {
    const bundler = {addAssetType: jest.fn()}
    const {calls} = bundler.addAssetType.mock
    const mdxAssetPath = createRequire(import.meta.url).resolve(
      '../src/MDXAsset'
    )
    plugin(bundler)
    expect(calls.length).toEqual(1)
    expect(calls[0][0]).toBe('mdx')
    expect(calls[0][1]).toBe(mdxAssetPath)
  })
})

describe('MDXAsset', () => {
  it('should work', async () => {
    const asset = new MDXAsset(
      fileURLToPath(new URL('./content.mdx', import.meta.url)),
      {
        rootDir: fileURLToPath(new URL('.', import.meta.url))
      }
    )

    const results = await asset.process()
    const result = results[0]

    expect(result.value).toContain('<h1>{"Test"}</h1>')

    expect(result.value).toContain(
      '<Component parentName="p" mdxType="Component">{"component"}</Component>'
    )
  })
})
