const images = require('remark-images')
const emoji = require('remark-emoji')

// See <https://github.com/vercel/next.js/tree/canary/packages/next-mdx> for
// more info.
const withMDX = require('@next/mdx')({
  options: {
    remarkPlugins: [images, emoji]
  }
})

module.exports = withMDX({
  pageExtensions: ['js', 'jsx', 'mdx']
})
