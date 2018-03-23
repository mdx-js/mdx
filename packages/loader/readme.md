# loader

Webpack loader for use with [MDX](https://github.com/mdx-js/mdx).

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

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

***

[Made by Compositor](https://compositor.io/)
|
[MIT License](../license)
