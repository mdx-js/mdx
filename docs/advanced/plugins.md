# Plugins

MDX uses [remark][] and [rehype][] internally.
These ecosystems focus on plugins that transform syntax trees.
This may sound very much like what MDX does.
In fact, that’s what we’re doing: the core of MDX is mostly plugins itself!
We first use `remark-mdx` to add MDX syntax support and then use a rehype
plugin to transpile it to JSX.
The final result is JSX that can be used in React/Preact/Vue/etc.

The flow of MDX consists of the following six steps:

1.  **Parse**: MDX text => MDAST
2.  **Transpile**: MDAST => MDXAST (remark-mdx)
3.  **Transform**: remark plugins applied to AST
4.  **Transpile**: MDXAST => MDXHAST
5.  **Transform**: rehype plugins applied to AST
6.  **Generate**: MDXHAST => JSX text

MDX allows you to hook into this flow at step 3 and 5, where you can use remark
and rehype plugins (respectively) to benefit from their ecosystems.

There are plugins to [capitalize titles][remark-capitalize], to [generate a
table of contents][remark-toc], and many more.

For more information, see the following links:

*   [List of remark plugins][remark-plugins]
*   [List of rehype plugins][rehype-plugins]

Creating a plugin for MDX is mostly the same as creating a plugin for remark
or rehype.
We wrote a guide on how to [write a plugin][write-plugin], and the unified website has another good guide on how to [create a plugin][create-plugin].
To see how the syntax trees in MDX deviate from the syntax trees used in remark
or rehype, see [the docs for the AST][ast].

## Using remark and rehype plugins

| Name            | Type     | Required | Description                                       |
| --------------- | -------- | -------- | ------------------------------------------------- |
| `remarkPlugins` | Array\[] | `false`  | Array of remark plugins to manipulate the MDXAST  |
| `rehypePlugins` | Array\[] | `false`  | Array of rehype plugins to manipulate the MDXHAST |

To use plugins, pass them under their respective name.
They are passed in the options to the core MDX library, but you’d typically pass
them through a loader like so:

```js
const images = require('remark-images')
const emoji = require('remark-emoji')

module.exports = {
  module: {
    rules: [
      {
        test: /\.mdx?$/,
        use: [
          {
            loader: 'babel-loader'
          },
          {
            loader: '@mdx-js/loader',
            options: {
              remarkPlugins: [images, emoji]
            }
          }
        ]
      }
    ]
  }
}
```

If you’re using MDX directly, they can be passed like so:

```js
const fs = require('fs')
const mdx = require('@mdx-js/mdx')
const images = require('remark-images')
const emoji = require('remark-emoji')

const mdxText = fs.readFileSync('hello.mdx', 'utf8')
const jsx = mdx.sync(mdxText, {
  remarkPlugins: [images, emoji]
})
```

Some plugins can be configured and accept their own options.
In that case, use the `[plugin, pluginOptions]` syntax, like so:

```js
mdx.sync(mdxText, {
  remarkPlugins: [
    images,
    [emoji, { padSpaceAfter: true }]
})
```

The above example ensures that `padSpaceAfter` is only passed as options to
the `emoji` plugin.

## Using retext plugins

[retext][] plugins are, like remark and rehype plugins, really useful.
But it’s currently not possible for MDX to convert the syntax tree to nlcst
(which is used by retext) as it wouldn’t be possible to correctly convert it
back.
This means that we can’t use retext plugins directly.
See [remarkjs/remark#224][] for more info.

Luckily, it’s possible to build a custom plugin that visits all text nodes with
[`unist-util-visit`][visit] and process them using retext (here we use
[`retext-smartypants`][retext-smartypants] as an example).
This works in most cases, and could look something like this:

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
  remarkPlugins: [
    // regular quotes → smart quotes,
    // triple dash → em dash
    // etc.
    [remarkSmartypants, { dashes: 'oldschool' }]
  ]
})
```

[ast]: /advanced/ast

[write-plugin]: /guides/writing-a-plugin

[remark]: https://github.com/remarkjs/remark

[rehype]: https://github.com/rehypejs/rehype

[remark-capitalize]: https://github.com/zeit/remark-capitalize

[remark-toc]: https://github.com/remarkjs/remark-toc

[remark-plugins]: https://github.com/remarkjs/remark/blob/master/doc/plugins.md#list-of-plugins

[rehype-plugins]: https://github.com/rehypejs/rehype/blob/master/doc/plugins.md#list-of-plugins

[retext]: https://github.com/retextjs/retext

[remarkjs/remark#224]: https://github.com/remarkjs/remark/issues/224

[visit]: https://github.com/syntax-tree/unist-util-visit

[retext-smartypants]: https://github.com/retextjs/retext-smartypants

[create-plugin]: https://unified.js.org/create-a-plugin.html
