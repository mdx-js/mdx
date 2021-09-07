const {test} = require('uvu')
const assert = require('uvu/assert')
const path = require('path')
const plugin = require('..')
const MDXAsset = require('../src/MDXAsset')

test('index: should add asset type', () => {
  const calls = []
  const bundler = {
    addAssetType: (...parameters) => {
      calls.push(parameters)
    }
  }
  const mdxAssetPath = require.resolve('../src/MDXAsset')
  plugin(bundler)
  assert.equal(calls.length, 1)
  assert.equal(calls[0][0], 'mdx')
  assert.equal(calls[0][1], mdxAssetPath)
})

test('MDXAsset: should work', async () => {
  const asset = new MDXAsset(path.resolve(__dirname, './content.mdx'), {
    rootDir: __dirname
  })

  const results = await asset.process()
  const result = results[0]

  assert.ok(result.value.includes('<h1>{"Test"}</h1>'))

  assert.ok(
    result.value.includes(
      '<Component parentName="p" mdxType="Component">{"component"}</Component>'
    )
  )
})

test.run()
