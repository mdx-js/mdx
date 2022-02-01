# `@mdx-js/rollup`

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

Rollup plugin for MDX.

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

This package is a Rollup plugin to support MDX.

## When should I use this?

This integration is useful if you’re using Rollup (or another tool that uses
Rollup, such as Vite).

This integration can be combined with the Babel plugin to support nonstandard
JSX runtimes (such as Vue) or compile modern JavaScript features to ones your
users support.

If you want to evaluate MDX code then the lower-level compiler (`@mdx-js/mdx`)
can be used manually.

## Install

This package is [ESM only][esm]:
Node 12+ is needed to use it and it must be `import`ed instead of `require`d.

[npm][]:

```sh
npm install @mdx-js/rollup
```

[yarn][]:

```sh
yarn add @mdx-js/rollup
```

## Use

Add something along these lines to your `rollup.config.js`:

```js
import mdx from '@mdx-js/rollup'

export default {
  // …
  plugins: [
    // …
    mdx({/* Options… */})
  ]
}
```

See also [¶ Vite][vite] and [¶ WMR][wmr], if you’re using Rollup through them,
for more info.

## API

This package exports a [Rollup][] plugin as the default export.

Source maps are supported based on how you configure Rollup.
You do not need to pass `options.SourceMapGenerator`.

###### `options`

`options` are the same as [`compile` from `@mdx-js/mdx`][options], with the
additions of:

###### `options.include`

###### `options.exclude`

List of [`picomatch`][pico] patterns to include and/or exclude
(`string`, `RegExp`, `Array<string|RegExp>`, default: `[]`).

###### Note: Babel

If you use modern JavaScript features you might want to use Babel through
[`@rollup/plugin-babel`][rollup-plugin-babel] to compile to code that works:

```js
// …
import {babel} from '@rollup/plugin-babel'

export default {
  // …
  plugins: [
    // …
    mdx({/* Options… */}),
    babel({
      // Also run on what used to be `.mdx` (but is now JS):
      extensions: ['.js', '.jsx', '.cjs', '.mjs', '.md', '.mdx'],
      // Other options…
    })
  ]
}
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

[MIT][] © [Titus Wormer][author]

[build-badge]: https://github.com/mdx-js/mdx/workflows/main/badge.svg

[build]: https://github.com/mdx-js/mdx/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/mdx-js/mdx/main.svg

[coverage]: https://codecov.io/github/mdx-js/mdx

[downloads-badge]: https://img.shields.io/npm/dm/@mdx-js/rollup.svg

[downloads]: https://www.npmjs.com/package/@mdx-js/rollup

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

[mit]: https://github.com/mdx-js/mdx/blob/main/packages/rollup/license

[author]: https://wooorm.com

[pico]: https://github.com/micromatch/picomatch#globbing-features

[rollup]: https://rollupjs.org

[rollup-plugin-babel]: https://github.com/rollup/plugins/tree/HEAD/packages/babel

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[security]: https://mdxjs.com/getting-started/#security

[types]: https://mdxjs.com/getting-started/#types

[options]: https://mdxjs.com/packages/mdx/#compilefile-options

[typescript]: https://www.typescriptlang.org

[vite]: https://mdxjs.com/getting-started/#vite

[wmr]: https://mdxjs.com/getting-started/#wmr
