# Next.js

Next.js provides an [official plugin][next-plugin] to simplify MDX importing into your project.

```
npm install --save-dev @zeit/next-mdx
```

To configure MDX, add the following to your `next.config.js`:

```js
const withMDX = require('@zeit/next-mdx')()

module.exports = withMDX()
```

### Use MDX for `.md` files

The Next.js MDX plugin allows for you to also use MDX parsing for `.md` files:

```js
const withMDX = require('@zeit/next-mdx')({
  extension: /\.mdx?$/
})

module.exports = withMDX({
  pageExtensions: ['js', 'jsx', 'md', 'mdx']
})
```

[next-plugin]: https://github.com/zeit/next-plugins/tree/master/packages/next-mdx
