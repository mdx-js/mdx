const emoji = require('remark-emoji')

module.exports = {
  // See <https://github.com/jaredpalmer/razzle/tree/master/packages/razzle-plugin-mdx>
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
