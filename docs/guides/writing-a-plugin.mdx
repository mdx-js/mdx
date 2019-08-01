# Writing a plugin

For a full-fledged introduction to plugins it’s recommended to read the [remark guides][remark-guides] and study up on [syntax trees][syntax-trees].

Now let’s consider an example where you want to pass all headings through the [title][] module to ensure consistent capitalization.  We can use [unist-util-visit][] to visit all headings and change the text nodes with `title(text)`.

## Visiting heading nodes

The first thing you want to do is install the `unist-util-visit` library.  This is a utility library that allows you
to visit all heading (or any other type of nodes) without having to write a lot of boiler plate code.  It handles that
for you.

Then you can first log out the nodes to see it in action:

```js
const visit = require('unist-util-visit')

module.exports = () => (tree, file) => {
  visit(tree, 'heading', node => {
    console.log(node)
  })
}
```

This will log out all the nodes in your document that are headings.  Inside heading nodes there are text nodes.  These
include the raw text included in the heading.

*Note*: The reason that heading nodes include multiple text node types is because there can be other
“[phrasing content][phrasing]” nodes.  For example if your heading looked like `# Hello, _world_`.  In addition to the
text there is also an emphasis node.

## Visiting text nodes

To walk the text nodes, you can use `unist-util-visit` again:

```js
const visit = require('unist-util-visit')

module.exports = () => (tree, file) => {
  visit(tree, 'heading', node => {
    visit(node, 'text', textNode => {
      console.log(textNode)
    })
  })
}
```

## Using the title library

Now that you are logging out the text nodes, you can now manipulate them with the title library by reassigning tthe value
to the node:

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

[phrasing]: https://www.w3.org/TR/2011/WD-html5-author-20110809/content-models.html#phrasing-content-0
