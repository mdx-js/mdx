# `@mdx-js/mdx`

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

MDX compiler.

## Contents

*   [Install](#install)
*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Contribute](#contribute)
*   [License](#license)

## Install

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c):
Node 12+ is needed to use it and it must be `import`ed instead of `require`d.

[npm][]:

```sh
npm install @mdx-js/mdx
```

[yarn][]:

```sh
yarn add @mdx-js/mdx
```

## What is this?

This package is a compiler that turns MDX into JavaScript.
It can also evaluate MDX code.

## When should I use this?

This is the core compiler for turning MDX into JavaScript and which gives you
the most control.
If you’re using a bundler (webpack, rollup, esbuild), or a site builder (gatsby,
next) or build system (vite, snowpack) which comes with a bundler, you’re better
off using an integration: see [§ Integrations](#).

## Contribute

See [§ Contribute][contribute] on our website for ways to get started.
See [§ Support][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][] © [Compositor][] and [Vercel][]

[build-badge]: https://github.com/mdx-js/mdx/workflows/main/badge.svg

[build]: https://github.com/mdx-js/mdx/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/mdx-js/mdx/main.svg

[coverage]: https://codecov.io/github/mdx-js/mdx

[downloads-badge]: https://img.shields.io/npm/dm/@mdx-js/mdx.svg

[downloads]: https://www.npmjs.com/package/@mdx-js/mdx

[size-badge]: https://img.shields.io/bundlephobia/minzip/@mdx-js/mdx.svg

[size]: https://bundlephobia.com/result?p=@mdx-js/mdx

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/mdx-js/mdx/discussions

[npm]: https://docs.npjs.com/cli/install

[yarn]: https://classic.yarnpkg.com/docs/cli/add/

[contribute]: https://v2.mdxjs.com/contributing/

[support]: https://v2.mdxjs.com/support/

[coc]: https://github.com/mdx-js/.github/blob/master/code-of-conduct.md

[mit]: license

[compositor]: https://compositor.io

[vercel]: https://vercel.com
