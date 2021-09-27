# `@mdx-js/rollup`

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

Rollup plugin for MDX.

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
npm install @mdx-js/rollup
```

[yarn][]:

```sh
yarn add @mdx-js/rollup
```

## What is this?

This package is a Rollup plugin to support MDX.

## When should I use this?

This integration is useful if you’re using Rollup (or another tool that uses
Rollup, such as Vite).

This integration can be combined with the Babel plugin to support nonstandard
JSX runtimes (such as Vue).

If you want to evaluate MDX code then the lower-level compiler (`@mdx-js/mdx`)
can be used manually.

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

[npm]: https://docs.npjs.com/cli/install

[yarn]: https://classic.yarnpkg.com/docs/cli/add/

[contribute]: https://v2.mdxjs.com/contributing/

[support]: https://v2.mdxjs.com/support/

[coc]: https://github.com/mdx-js/.github/blob/master/code-of-conduct.md

[mit]: license

[author]: https://wooorm.com
