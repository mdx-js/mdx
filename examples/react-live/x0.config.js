module.exports = {
  module: {
    rules: [
      {
        test: /\.md?$/,
        use: [
          'babel-loader',
          '@compositor/markdown-loader'
        ]
      }
    ]
  }
}
