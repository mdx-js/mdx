const emoji = require('remark-emoji')

module.exports = {
  // See <https://github.com/jaredpalmer/razzle/tree/master/packages/razzle-plugin-mdx>
  // for more info.
  // Note: `razzle-plugin-mdx` is on a pre-1 MDX version, so many things might
  // not work.
  plugins: [
    {
      name: 'mdx',
      options: {
        mdPlugins: [emoji]
      }
    }
  ]
}
