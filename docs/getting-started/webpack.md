# Webpack

MDX provides a loader that needs to be used in tandem with the [babel-loader][babel-loader].

## Basic Setup

For webpack projects you can define the following `webpack.config.js` extension handler for `.md`/`.mdx` files:

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.mdx?$/,
        use: ['babel-loader', '@mdx-js/loader']
      }
    ]
  }
}
```

It's important to note that the MDX loader is followed by the babel-loader so that the JSX can be transpiled to JavaScript.

[babel-loader]: https://npmjs.com/package/babel-loader
