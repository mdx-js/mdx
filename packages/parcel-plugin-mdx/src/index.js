module.exports = function(bundler) {
  const assetTypePath = require.resolve('./MDXAsset.js')
  bundler.addAssetType('md', assetTypePath)
  bundler.addAssetType('mdx', assetTypePath)
}
