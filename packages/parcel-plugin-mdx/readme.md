# `@mdx-js/parcel-plugin-mdx`

[![Build Status][build-badge]][build]
[![lerna][lerna-badge]][lerna]
[![Join the community on Spectrum][spectrum-badge]][spectrum]

An experimental [Parcel][] plugin for [MDX][].

## Installation

[npm][]:

```sh
npm i -D @mdx-js/parcel-plugin-mdx
```

Or with [Yarn][]:

```sh
yarn add -D @mdx-js/parcel-plugin-mdx
```

## Usage

```jsx
// index.js
import MDXContent from './content.mdx';

...

render(<MDXContent />, root);
```

## Contribute

See [`contributing.md` in `mdx-js/mdx`][contributing] for ways to get started.

This organisation has a [Code of Conduct][coc].
By interacting with this repository, organisation, or community you agree to
abide by its terms.

## License

[MIT][] © [Compositor][] and [ZEIT][]

<!-- Definitions -->

[build]: https://travis-ci.com/mdx-js/mdx

[build-badge]: https://travis-ci.com/mdx-js/mdx.svg?branch=master

[lerna]: https://lernajs.io/

[lerna-badge]: https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg

[spectrum]: https://spectrum.chat/mdx

[spectrum-badge]: https://withspectrum.github.io/badge/badge.svg

[contributing]: https://github.com/mdx-js/mdx/blob/master/contributing.md

[coc]: https://github.com/mdx-js/mdx/blob/master/code-of-conduct.md

[mit]: https://github.com/mdx-js/mdx/blob/master/license

[compositor]: https://compositor.io

[zeit]: https://zeit.co

[mdx]: https://github.com/mdx-js/mdx

[parcel]: https://parceljs.org

[npm]: https://docs.npmjs.com/cli/install

[yarn]: https://yarnpkg.com/lang/en/docs/cli/install/
