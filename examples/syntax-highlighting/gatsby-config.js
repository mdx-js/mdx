module.exports = {
  plugins: [
    {
      resolve: 'gatsby-mdx',
      options: {
        defaultLayouts: {
          default: require.resolve('./src/components/Layout')
        }
      }
    }
  ]
}
