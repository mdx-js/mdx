# @[mdx][]-js/mdxs

[![Build Status][build-badge]][build]
[![lerna][lerna-badge]][lerna]
[![Join the community on Spectrum][spectrum-badge]][spectrum]

> :warning: This project is currently in alpha

Multi-doc syntax support for MDX.

## Installation

```sh
npm install --save mdxs
```

## Usage

```js
const mdx = require('@mdx-js/mdx')
const mdxs = require('@mdx-js/mdxs')

const jsx = await mdx(FIXTURE, {
  compilers: [mdxs]
})
```

## Syntax

```md

# Hello, I'm document 1

---

# Hello, I'm document 2
```

## Contribute

See [`contributing.md` in `mdx-js/mdx`][contributing] for ways to get started.

This organisation has a [Code of Conduct][coc].
By interacting with this repository, organisation, or community you agree to
abide by its terms.

## License

[MIT][] © [John Otander][author]

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

[mdx]: https://github.com/mdx-js/mdx

[author]: https://johno.com
