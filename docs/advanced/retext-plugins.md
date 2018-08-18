# Using Retext Plugins

[Retext][] plugins are really useful, but MDX can't convert the syntax tree to retext because it wouldn't be possible to convert it back to remark. This means that we can't use retext plugins directly. [remarkjs/remark#224][]

Luckily, it's possible to build a custom plugin that visits all text nodes using [unist-util-visit][] and process them using retext:

```js
const visit = require('unist-util-visit')
const retext = require('retext')
const retextSmartypants = require('retext-smartypants')
const mdx = require('@mdx-js/mdx')

function remarkSmartypants(options) {
  const processor = retext()
    .use(retextSmartypants, options)
  function transformer(tree) {
    visit(tree, 'text', node => {
      node.value = String(processor.processSync(node.value))
    })
  }
  return transformer
}

const mdxText = `
> "Veni, vidi, vici." ---Julius Caesar
`

mdx.sync(mdxText, {
  mdPlugins: [
    // regular quotes → smart quotes,
    // triple dash → em dash
    // etc.
    [remarkSmartypants, { dashes: 'oldschool' }]
  ]
})
```

[Retext]: https://github.com/retextjs/retext
[remarkjs/remark#224]: https://github.com/remarkjs/remark/issues/224
[unist-util-visit]: https://github.com/syntax-tree/unist-util-visit
