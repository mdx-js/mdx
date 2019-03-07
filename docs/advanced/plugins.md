# Plugins

Since MDX uses the [remark][]/[rehype][] ecosystems, you can use plugins to
modify the AST at different stages of the transpilation process.  This allows
you to do powerful things like ensure title case capitalization of your headings
or automate the creation of a table of contents.

The core of MDX is built as two plugins itself!  It first uses `remark-mdx` to
add MDX syntax support and then a rehype plugin to transpile it to JSX.

## Transpilation

The MDX transpilation flow consists of six steps, ultimately resulting in JSX
that can be used in React/Preact/Vue/etc.

1.  **Parse**: Text => MDAST
2.  **Transpile**: MDAST => MDXAST (remark-mdx)
3.  **Transform**: MDX/Remark plugins applied to AST
4.  **Transpile**: MDXAST => MDXHAST
5.  **Transform**: Hyperscript plugins applied to AST
6.  **Transpile**: MDXHAST => JSX

### Options

| Name          | Type     | Required | Description                                       |
| ------------- | -------- | -------- | ------------------------------------------------- |
| `mdPlugins`   | Array\[] | `false`  | Array of remark plugins to manipulate the MDAST   |
| `hastPlugins` | Array\[] | `false`  | Array of rehype plugins to manipulate the MDXHAST |

#### Specifying plugins

Plugins need to be passed to MDX core library, this is often as options to your
loader:

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
              mdPlugins: [images, emoji]
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
  mdPlugins: [images, emoji]
})
```

#### Plugin options

If a plugin needs specific options, use the `[plugin, pluginOptions]` syntax.

```js
mdx.sync(mdxText, {
  mdPlugins: [
    images,
    [emoji, { padSpaceAfter: true }]
})
```

The following example ensures that `padSpaceAfter` is only passed as options to
the `emoji` plugin.

[remark]: https://github.com/remarkjs/remark

[rehype]: https://github.com/rehypejs/rehype
