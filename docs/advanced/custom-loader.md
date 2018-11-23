# Custom loader

By design, the default MDX is very minimal and likely won’t see any additional features outside of the MDX spec.  However, webpack [makes it straightforward][webpack-loader] to write your own loader to add custom syntax support.

Consider a scenario where you wanted to add frontmatter support to all your MDX documents.  You could achieve this with a remark plugin or a custom loader.  Here we’ll write a [custom loader][x0]:

```js
// lib/fm-loader.js
const matter = require('gray-matter')
const stringifyObject = require('stringify-object')

module.exports = async function (src) {
  const callback = this.async()
  const { content, data } = matter(src)

  const code = `
    export const frontMatter = ${stringifyObject(data)}

    ${content}
  `
  return callback(null, code)
}
```

The loader code above parses out the frontmatter, exports it as the named export `frontMatter`, and then returns the rest of the document which will then be handled by `@mdx-js/loader` and then `babel-loader`.

Then, you can use it with the following config:

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.mdx?$/,
        use: [
          'babel-loader',
          '@mdx-js/loader',
          path.join(__dirname, './lib/fm-loader')
        ]
      }
    ]
  }
}
```

[webpack-loader]: https://webpack.js.org/contribute/writing-a-loader

[x0]: https://github.com/c8r/x0/blob/master/lib/mdx-fm-loader.js
