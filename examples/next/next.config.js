module.exports = {
  pagesExtensions: ['js', 'jsx', 'md'],
  webpack: (config, { defaultLoaders }) => {
    config.module.rules.push({
      test: /\.md$/,
      use: [defaultLoaders.babel, '@compositor/markdown-loader']
    })

    return config
  }
}
