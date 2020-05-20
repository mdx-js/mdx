const unified = require('unified')
const english = require('retext-english')
const wooorm = require('retext-preset-wooorm')

module.exports = {
  plugins: [
    './packages/remark-mdx',
    './packages/remark-mdxjs',
    'preset-wooorm',
    'preset-prettier',
    [
      'retext',
      unified()
        .use(english)
        .use(wooorm)
        .use({
          plugins: [[require('retext-sentence-spacing'), false]]
        })
    ],
    ['validate-links', false]
  ]
}
