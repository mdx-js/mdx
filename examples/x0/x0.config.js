module.exports = {
  module: {
    rules: [
      {
        test: /\.md?$/,
        use: ['babel-loader', '@mdx-js/loader']
      }
    ]
  }
}
