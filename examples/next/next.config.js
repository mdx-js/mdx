module.exports = {
  webpack: config => {
    config.module.rules.push({
      test: /\.md$/,
      use: [
        'babel-loader',
        '@compositor/markdown-loader'
      ]
    })

    return config
  }
}
