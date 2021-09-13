const emoji = require('remark-emoji')

module.exports = {
  // See <https://razzlejs.org/plugins/razzle-plugin-mdx>
  // for more info.
  plugins: [
    {
      name: 'mdx',
      options: {
        remarkPlugins: [emoji]
      }
    }
  ]
}
