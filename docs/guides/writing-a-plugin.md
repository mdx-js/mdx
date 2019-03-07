# Writing a plugin

For a full-fledged introduction to plugins it’s recommended to read the [remark guides][remark-guides] and about [syntax trees][syntax-trees].

Now let’s consider an example where we want to pass all headings through the [title][] module to ensure consistent capitalization.  We can use [unist-util-visit][] to visit all headings and change the text nodes with `title(text)`.

```js
const title = require('title')
const visit = require('unist-util-visit')

module.exports = () => (tree, file) => {
  visit(tree, 'heading', node => {
    visit(node, 'text', textNode => {
      const text = textNode.value ? textNode.value.trim() : ''  
      textNode.value = title(text)
    })
  })
}
```

[remark-guides]: https://github.com/remarkjs/remark/blob/master/doc/plugins.md#creating-plugins

[syntax-trees]: https://github.com/syntax-tree/unist#syntax-tree

[title]: https://github.com/zeit/title

[unist-util-visit]: https://github.com/syntax-tree/unist-util-visit
