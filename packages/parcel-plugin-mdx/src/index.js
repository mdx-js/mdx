module.exports = function(bundler) {
  bundler.addAssetType('mdx', require.resolve('./MDXAsset.js'))
}
