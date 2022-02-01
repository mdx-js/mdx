# `@mdx-js/loader`

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

webpack loader for MDX.

<!-- more -->

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

This package is a webpack loader to support MDX.

## When should I use this?

This integration is useful if you’re using webpack (or another tool that uses
webpack, such as Next.js).

This integration can be combined with the Babel loader to support nonstandard
JSX runtimes (such as Vue) or compile modern JavaScript features to ones your
users support.

If you want to evaluate MDX code then the lower-level compiler (`@mdx-js/mdx`)
can be used manually.

## Install

This package is [ESM only][esm]:
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
        use: [
          {
            loader: '@mdx-js/loader',
            /** @type {import('@mdx-js/loader').Options} */
            options: {}
          }
        ]
      }
    ]
  }
}
```

See also [¶ Create React App (CRA)][cra], [¶ Next.js][next], and
[¶ Vue CLI][vue-cli], if you’re using webpack through them, for more info.

## API

This package exports a [webpack][] plugin as the default export.

Source maps are supported based on how you configure webpack.
You do not need to pass `options.SourceMapGenerator`.

###### `options`

`options` are the same as [`compile` from `@mdx-js/mdx`][options].

###### Note: Babel

If you use modern JavaScript features you might want to use Babel through
[`babel-loader`][babel-loader] to compile to code that works:

```js
// …
use: [
  // Note that Webpack runs right-to-left: `@mdx-js/loader` is used first, then
  // `babel-loader`.
  {loader: 'babel-loader', options: {}},
  {
    loader: '@mdx-js/loader',
    /** @type {import('@mdx-js/loader').Options} */
    options: {},
  },
];
// …
```

## Types

This package is fully typed with [TypeScript][].
See [§ Types][types] on our website for information.

An `Options` type is exported, which represents acceptable configuration.

## Security

See [§ Security][security] on our website for information.

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

[npm]: https://docs.npmjs.com/cli/install

[yarn]: https://classic.yarnpkg.com/docs/cli/add/

[contribute]: https://mdxjs.com/community/contribute/

[support]: https://mdxjs.com/community/support/

[coc]: https://github.com/mdx-js/.github/blob/main/code-of-conduct.md

[mit]: https://github.com/mdx-js/mdx/blob/main/packages/loader/license

[vercel]: https://vercel.com

[webpack]: https://webpack.js.org

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[types]: https://mdxjs.com/getting-started/#types

[security]: https://mdxjs.com/getting-started/#security

[options]: https://mdxjs.com/packages/mdx/#compilefile-options

[typescript]: https://www.typescriptlang.org

[babel-loader]: https://webpack.js.org/loaders/babel-loader/

[cra]: https://mdxjs.com/getting-started/#create-react-app-cra

[next]: https://mdxjs.com/getting-started/#nextjs

[vue-cli]: https://mdxjs.com/getting-started/#vue-cli
