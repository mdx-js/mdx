# markdown-loader

Markdown loader for use with [`c8r/markdown`](https://github.com/c8r/markdown).

## Installation

```sh
npm i -D @compositor/markdown-loader
```

## Usage

An example configuration:

```js
// ...
module: {
  rules: [
    // ...
    {
      test: /\.md?$/,
      use: [
        'babel-loader',
        '@compositor/markdown-loader'
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
[MIT License](license)
