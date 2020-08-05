module.exports = {
  plugins: [
    'remark-frontmatter',
    './packages/remark-mdx',
    'preset-wooorm',
    'preset-prettier',
    ['retext', false],
    ['validate-links', false]
  ]
}
