# `@mdx-js/loader`

[![Build Status][build-badge]][build]
[![lerna][lerna-badge]][lerna]
[![Join the community on Spectrum][spectrum-badge]][spectrum]

Webpack loader for [MDX][].

## Installation

[npm][]:

```sh
npm i -D @mdx-js/loader
```

## Usage

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

## Contribute

See [`contributing.md` in `mdx-js/mdx`][contributing] for ways to get started.

This organisation has a [Code of Conduct][coc].
By interacting with this repository, organisation, or community you agree to
abide by its terms.

## License

[MIT][] © [Compositor][] and [ZEIT][]

<!-- Definitions -->

[build]: https://travis-ci.org/mdx-js/mdx

[build-badge]: https://travis-ci.org/mdx-js/mdx.svg?branch=master

[lerna]: https://lernajs.io/

[lerna-badge]: https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg

[spectrum]: https://spectrum.chat/mdx

[spectrum-badge]: https://withspectrum.github.io/badge/badge.svg

[contributing]: https://github.com/mdx-js/mdx/blob/master/contributing.md

[coc]: https://github.com/mdx-js/mdx/blob/master/code-of-conduct.md

[mit]: license

[compositor]: https://compositor.io

[zeit]: https://zeit.co

[mdx]: https://github.com/mdx-js/mdx

[npm]: https://docs.npmjs.com/cli/install
