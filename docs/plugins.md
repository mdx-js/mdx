# Plugins

Since MDX uses the [remark][]/[rehype][] ecosystems, you can use plugins to modify the AST at different stages of the transpilation process.

## Transpilation

The MDX transpilation flow consists of six steps, ultimately resulting in JSX that can be used in React/Preact/etc.

1. __Parse__: Text => MDAST
1. __Transpile__: MDAST => MDXAST
1. __Transform__: MDX/Remark plugins applied to AST
1. __Transpile__: MDXAST => MDXHAST
1. __Transform__: Hyperscript plugins applied to AST
1. __Transpile__: MDXHAST => JSX

### Options

Name | Type | Required | Description
---- | ---- | -------- | -----------
`mdPlugins` | Array[] | `false` | Array of remark plugins to manipulate the MDAST
`hastPlugins` | Array[] | `false` | Array of rehype plugins to manipulate the MDXHAST

#### Specifying plugins

Plugins need to be passed to MDX core library, this is often as options to your loader:

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

Though if you're using MDX directly, they can be passed like so:

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

The following example ensures that `padSpaceAfter` is only passed as options to the `emoji` plugin.

[remark]: https://github.com/remarkjs/remark
[rehype]: https://github.com/rehypejs/rehype
