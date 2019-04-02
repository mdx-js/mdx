module.exports = {
  plugins: [
    'gatsby-plugin-emotion',
    {
      resolve: 'gatsby-mdx',
      options: {
        extensions: ['.mdx', '.md']
      }
    }
  ]
}
