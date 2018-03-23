# @mdx-js/loader

Webpack loader for [MDX](https://github.com/mdx-js/mdx).

## Installation

```sh
npm i -D @mdx-js/loader
```

## Usage

An example configuration:

```js
// ...
module: {
  rules: [
    // ...
    {
      test: /\.md$/,
      use: [
        'babel-loader',
        '@mdx-js/loader'
      ]
    }
  ]
}
```
