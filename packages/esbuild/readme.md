# `@mdx-js/esbuild`

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

esbuild plugin for MDX.

<!-- more -->

## Contents

* [What is this?](#what-is-this)
* [When should I use this?](#when-should-i-use-this)
* [Install](#install)
* [Use](#use)
* [API](#api)
  * [`mdx(options?)`](#mdxoptions)
  * [`Options`](#options)
* [Types](#types)
* [Compatibility](#compatibility)
* [Security](#security)
* [Contribute](#contribute)
* [License](#license)

## What is this?

This package is an esbuild plugin to support MDX.

## When should I use this?

This integration is useful if you’re using [esbuild][] (or another tool that
uses esbuild).

If you want to evaluate MDX code then the lower-level compiler (`@mdx-js/mdx`)
can be used.
to support nonstandard JSX runtime (such as Vue), `@mdx-js/mdx` can also be
used, or our webpack loader (`@mdx-js/loader`) or Rollup plugin
(`@mdx-js/rollup`).

## Install

This package is [ESM only][esm].
In Node.js (version 16+), install with [npm][]:

```sh
npm install @mdx-js/esbuild
```

## Use

Do something like this with the esbuild API:

```tsx
import mdx from '@mdx-js/esbuild'
import esbuild from 'esbuild'

await esbuild.build({
  // Replace `index.js` with your entry point that imports MDX files:
  entryPoints: ['index.js'],
  format: 'esm',
  outfile: 'output.js',
  plugins: [mdx({/* jsxImportSource: …, otherOptions… */})]
})
```

## API

This package exports no identifiers.
The default export is [`mdx`][api-mdx].

### `mdx(options?)`

Create an esbuild plugin to compile MDX to JS.

esbuild takes care of turning modern JavaScript features into syntax that works
wherever you want it to.
With other integrations you might need to use Babel for this, but with
esbuild that’s not needed.
See esbuild’s docs for more info.

###### Parameters

* `options` ([`Options`][api-options], optional)
  — configuration

###### Returns

ESBuild plugin ([`Plugin`][esbuild-plugin] from `esbuild`).

### `Options`

Configuration (TypeScript type).

Options are the same as [`CompileOptions` from `@mdx-js/mdx`][compile-options].

## Types

This package is fully typed with [TypeScript][].
It exports the additional type [`Options`][api-options].
See [§ Types][types] on our website for information.

## Compatibility

Projects maintained by the unified collective are compatible with maintained
versions of Node.js.

When we cut a new major release, we drop support for unmaintained versions of
Node.
This means we try to keep the current release line, `@mdx-js/esbuild@^3`,
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

[downloads-badge]: https://img.shields.io/npm/dm/@mdx-js/esbuild.svg

[downloads]: https://www.npmjs.com/package/@mdx-js/esbuild

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/mdx-js/mdx/discussions

[npm]: https://docs.npmjs.com/cli/install

[contribute]: https://mdxjs.com/community/contribute/

[support]: https://mdxjs.com/community/support/

[coc]: https://github.com/mdx-js/.github/blob/main/code-of-conduct.md

[mit]: https://github.com/mdx-js/mdx/blob/main/packages/esbuild/license

[author]: https://wooorm.com

[esbuild]: https://esbuild.github.io

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[types]: https://mdxjs.com/getting-started/#types

[security]: https://mdxjs.com/getting-started/#security

[typescript]: https://www.typescriptlang.org

[compile-options]: https://mdxjs.com/packages/mdx/#compileoptions

[esbuild-plugin]: https://esbuild.github.io/plugins/

[api-mdx]: #mdxoptions

[api-options]: #options
