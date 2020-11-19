module.exports = {
  plugins: [
    './packages/remark-mdx',
    './packages/remark-mdxjs',
    'preset-wooorm',
    'preset-prettier',
    ['retext', false],
    ['validate-links', false]
  ]
}
