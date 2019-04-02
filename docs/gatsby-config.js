module.exports = {
  plugins: [
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-emotion',
    {
      resolve: 'gatsby-mdx',
      options: {
        extensions: ['.mdx', '.md']
      }
    }
  ]
}
