# Next.js

Next.js provides an [official plugin][next-plugin] to simplify MDX importing
into your project.

```shell
npm install --save-dev @next/mdx @mdx-js/loader 
```

To configure MDX, add the following to your `next.config.js`:

```js
const withMDX = require('@next/mdx')()

module.exports = withMDX()
```

### Use MDX for `.md` files

The Next.js MDX plugin allows for you to also use MDX parsing for `.md` files:

```js
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/
})

module.exports = withMDX({
  pageExtensions: ['js', 'jsx', 'md', 'mdx']
})
```

[next-plugin]: https://github.com/zeit/next.js/tree/master/packages/next-mdx
