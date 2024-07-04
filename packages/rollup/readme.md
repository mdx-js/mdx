# `@mdx-js/rollup`

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

Rollup (and Vite) plugin for MDX.

<!-- more -->

## Contents

* [What is this?](#what-is-this)
* [When should I use this?](#when-should-i-use-this)
* [Install](#install)
* [Use](#use)
* [API](#api)
  * [`mdx(options?)`](#mdxoptions)
  * [`Options`](#options)
* [Examples](#examples)
  * [Combine with Babel](#combine-with-babel)
* [Types](#types)
* [Compatibility](#compatibility)
* [Security](#security)
* [Contribute](#contribute)
* [License](#license)

## What is this?

This package is a Rollup (and Vite) plugin to support MDX.

## When should I use this?

This integration is useful if you’re using Rollup (or another tool that uses
Rollup, such as Vite).

This integration can be combined with the Babel plugin to compile modern
JavaScript features to ones your users support.

If you want to evaluate MDX code then the lower-level compiler (`@mdx-js/mdx`)
can be used manually.

## Install

This package is [ESM only][esm].
In Node.js (version 16+), install with [npm][]:

```sh
npm install @mdx-js/rollup
```

## Use

Add something along these lines to your `rollup.config.js`:

```tsx
/**
 * @import {RollupOptions} from 'rollup'
 */

import mdx from '@mdx-js/rollup'

/** @type {RollupOptions} */
const config = {
  // …
  plugins: [
    // …
    mdx({/* jsxImportSource: …, otherOptions… */})
  ]
}

export default config
```

See also [¶ Vite][vite] if you’re using Rollup through them for more info.

## API

This package exports no identifiers.
The default export is [`mdx`][api-mdx].

### `mdx(options?)`

Plugin to compile MDX w/ [rollup][].

###### Parameters

* `options` ([`Options`][api-options], optional)
  — configuration

###### Returns

Rollup (and Vite) plugin.

### `Options`

Configuration (TypeScript type).

Options are the same as [`CompileOptions` from `@mdx-js/mdx`][compile-options]
with the exception that the `SourceMapGenerator` option is supported based on
how you configure Rollup.
You cannot pass it manually.
When using Vite, the `development` option is also supported based on how you
configure Vite.

There are also two additional options:

###### Fields

* `exclude` (`Array<RegExp | string>`, `RegExp`, or `string`, optional)
  — [picomatch][] patterns to exclude
* `include` (`Array<RegExp | string>`, `RegExp`, or `string`, optional)
  — [picomatch][] patterns to include

## Examples

### Combine with Babel

If you use modern JavaScript features you might want to use Babel through
[`@rollup/plugin-babel`][rollup-plugin-babel] to compile to code that works:

```tsx
/**
 * @import {RollupOptions} from 'rollup'
 */

import mdx from '@mdx-js/rollup'
import {babel} from '@rollup/plugin-babel'

/** @type {RollupOptions} */
const config = {
  // …
  plugins: [
    // …
    mdx({/* jsxImportSource: …, otherOptions… */}),
    babel({
      // Also run on what used to be `.mdx` (but is now JS):
      extensions: ['.js', '.jsx', '.cjs', '.mjs', '.md', '.mdx']
      // Other options…
    })
  ]
}

export default config
```

## Types

This package is fully typed with [TypeScript][].
It exports the additional type [`Options`][api-options].
See [§ Types][types] on our website for information.

## Compatibility

Projects maintained by the unified collective are compatible with maintained
versions of Node.js.

When we cut a new major release, we drop support for unmaintained versions of
Node.
This means we try to keep the current release line, `@mdx-js/rollup@^3`,
compatible with Node.js 16.

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

[contribute]: https://mdxjs.com/community/contribute/

[support]: https://mdxjs.com/community/support/

[coc]: https://github.com/mdx-js/.github/blob/main/code-of-conduct.md

[mit]: https://github.com/mdx-js/mdx/blob/main/packages/rollup/license

[author]: https://wooorm.com

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[security]: https://mdxjs.com/getting-started/#security

[types]: https://mdxjs.com/getting-started/#types

[picomatch]: https://github.com/micromatch/picomatch#globbing-features

[rollup]: https://rollupjs.org

[rollup-plugin-babel]: https://github.com/rollup/plugins/tree/HEAD/packages/babel

[typescript]: https://www.typescriptlang.org

[compile-options]: https://mdxjs.com/packages/mdx/#compileoptions

[vite]: https://mdxjs.com/getting-started/#vite

[api-mdx]: #mdxoptions

[api-options]: #options
