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

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`mdx(options?)`](#mdxoptions)
*   [Types](#types)
*   [Security](#security)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package is an esbuild plugin to support MDX.

## When should I use this?

This integration is useful if you’re using esbuild (or another tool that uses
esbuild).

If you want to evaluate MDX code then the lower-level compiler (`@mdx-js/mdx`)
can be used.
to support nonstandard JSX runtime (such as Vue), `@mdx-js/mdx` can also be
used, or our webpack loader (`@mdx-js/loader`) or Rollup plugin
(`@mdx-js/rollup`).

## Install

This package is [ESM only][esm]:
Node 12+ is needed to use it and it must be `import`ed instead of `require`d.

[npm][]:

```sh
npm install @mdx-js/esbuild
```

[yarn][]:

```sh
yarn add @mdx-js/esbuild
```

## Use

Do something like this with the esbuild API:

```js
import esbuild from 'esbuild'
import mdx from '@mdx-js/esbuild'

await esbuild.build({
  entryPoints: ['index.mdx'],
  outfile: 'output.js',
  format: 'esm',
  plugins: [mdx({/* Options… */})]
})
```

## API

This package exports a function as the default export that returns an
[esbuild][] plugin.

### `mdx(options?)`

Create an esbuild plugin to compile MDX to JS.

esbuild takes care of turning modern JavaScript features into syntax that works
wherever you want it to.
With other integrations you might need to use Babel for this, but with
esbuild that’s not needed.
See esbuild’s docs for more info.

###### `options`

`options` are the same as
[`compile` from `@mdx-js/mdx`][options]
with the addition of:

###### `options.allowDangerousRemoteMdx`

> ⚠️ **Security**: this includes remote code in your bundle.
> Make sure you trust it!
> See [§ Security][security] for more
> info.

> 💡 **Experiment**: this is an experimental feature that might not work
> well and might change in minor releases.

Whether to allow importing from `http:` and `https:` URLs (`boolean`, default:
`false`).

When passing `allowDangerousRemoteMdx`, MD(X) and JS files can be imported from
`http:` and `https:` urls.
Take this `index.mdx` file:

```jsx
import Readme from 'https://raw.githubusercontent.com/mdx-js/mdx/main/readme.md'

Here’s the readme:

<Readme />
```

And a module `build.js`:

```js
import esbuild from 'esbuild'
import mdx from '@mdx-js/esbuild'

await esbuild.build({
  entryPoints: ['index.mdx'],
  outfile: 'output.js',
  format: 'esm',
  plugins: [mdx({allowDangerousRemoteMdx: true, /* Other options… */})]
})
```

Running that (`node build.js`) and evaluating `output.js` (depends on how you
evaluate React stuff) would give:

```jsx
<p>Here’s the readme:</p>
<h1>MDX: Markdown for the component era 🚀</h1>
{/* … */}
<p><a href="https://github.com/mdx-js/mdx/blob/main/license">MIT</a> © …</p>
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

[downloads-badge]: https://img.shields.io/npm/dm/@mdx-js/esbuild.svg

[downloads]: https://www.npmjs.com/package/@mdx-js/esbuild

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

[mit]: https://github.com/mdx-js/mdx/blob/main/packages/esbuild/license

[author]: https://wooorm.com

[esbuild]: https://esbuild.github.io

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[types]: https://mdxjs.com/getting-started/#types

[security]: https://mdxjs.com/getting-started/#security

[options]: https://mdxjs.com/packages/mdx/#compilefile-options

[typescript]: https://www.typescriptlang.org
