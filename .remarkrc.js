module.exports = {
  plugins: [
    './packages/remark-mdx',
    'preset-wooorm',
    'preset-prettier',
    ['retext', false],
    ['validate-links', false]
  ]
}
