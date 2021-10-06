# `@mdx-js/loader`

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

webpack plugin for MDX.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
*   [Types](#types)
*   [Security](#security)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package is a webpack plugin to support MDX.

## When should I use this?

This integration is useful if you’re using webpack (or another tool that uses
webpack, such as Next).

This integration can be combined with the Babel loader to support nonstandard
JSX runtimes (such as Vue).

If you want to evaluate MDX code then the lower-level compiler (`@mdx-js/mdx`)
can be used manually.

## Install

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c):
Node 12+ is needed to use it and it must be `import`ed instead of `require`d.

[npm][]:

```sh
npm install @mdx-js/loader
```

[yarn][]:

```sh
yarn add @mdx-js/loader
```

## Use

Add something along these lines to your `webpack.config.js`:

```js
module.exports = {
  module: {
    // …
    rules: [
      // …
      {
        test: /\.mdx?$/,
        use: [{loader: '@mdx-js/loader', options: {}}]
      }
    ]
  }
}
```

## API

This package exports a [webpack][] plugin as the default export.

Source maps are supported when
[`options.SourceMapGenerator`](https://v2.mdxjs.com/packages/mdx/#optionssourcemapgenerator)
is passed in.

###### `options`

`options` are the same as
[`compile`](https://v2.mdxjs.com/packages/mdx/#compilefile-options)
from `@mdx-js/mdx`.

###### Note: Babel

If you use modern JavaScript features you might want to use Babel through
[`babel-loader`](https://webpack.js.org/loaders/babel-loader/) to compile to
code that works:

```js
// …
use: [
  // Note that Webpack runs right-to-left: `@mdx-js/loader` is used first, then
  // `babel-loader`.
  {loader: 'babel-loader', options: {}},
  {loader: '@mdx-js/loader', options: {}}
]
// …
```

###### Note: `webpack-cli`

`webpack-cli` doesn’t support loaders in ESM directly or even *indirectly*.
Because `@mdx-js/mdx` itself is ESM, this means the `@mdx-js/loader` loader
(even though it’s CJS) doesn’t work with `webpack-cli` (it does work when using
the webpack API).
To use this loader with `webpack-cli`, set the `DISABLE_V8_COMPILE_CACHE=1`
environment variable.
See
[this issue](https://github.com/wooorm/xdm/issues/11#issuecomment-785043772) for
details.

```sh
DISABLE_V8_COMPILE_CACHE=1 webpack
```

## Types

This package is fully typed with [TypeScript](https://www.typescriptlang.org).

An additional `Options` type is exported, which represents acceptable
configuration.

To enable types for imported `.mdx` files, install `@types/mdx` and use it.
To use these types in JavaScript, do:

```js
/**
 * @typedef {import('@types/mdx')}
 */

import Post from './example.mdx'
// `Post` is now typed.
```

Alternatively, in TypeScript, do:

```ts
/// <reference types="@types/mdx" />

import Post from './example.mdx'
// `Post` is now typed.
```

## Security

See [§ Security](https://v2.mdxjs.com/getting-started/#security) on our website
for information.

## Contribute

See [§ Contribute][contribute] on our website for ways to get started.
See [§ Support][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][] © Compositor and [Vercel][]

[build-badge]: https://github.com/mdx-js/mdx/workflows/main/badge.svg

[build]: https://github.com/mdx-js/mdx/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/mdx-js/mdx/main.svg

[coverage]: https://codecov.io/github/mdx-js/mdx

[downloads-badge]: https://img.shields.io/npm/dm/@mdx-js/loader.svg

[downloads]: https://www.npmjs.com/package/@mdx-js/loader

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/mdx-js/mdx/discussions

[npm]: https://docs.npjs.com/cli/install

[yarn]: https://classic.yarnpkg.com/docs/cli/add/

[contribute]: https://v2.mdxjs.com/contributing

[support]: https://v2.mdxjs.com/support

[coc]: https://github.com/mdx-js/.github/blob/master/code-of-conduct.md

[mit]: https://github.com/mdx-js/mdx/blob/main/packages/loader/license

[vercel]: https://vercel.com

[webpack]: https://webpack.js.org
