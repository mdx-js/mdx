const images = require('remark-images')
const emoji = require('remark-emoji')

const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [images, emoji]
  }
})

module.exports = withMDX({
  pageExtensions: ['js', 'jsx', 'md', 'mdx']
})
