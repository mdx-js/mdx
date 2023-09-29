# `@mdx-js/register`

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

Node hook to require MDX.

<!-- more -->

> 🪦 **Legacy**: This package is not recommended for use as it depends on
> deprecated Node features.

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

This package is a Node CommonJS hook to support MDX.
[`require.extensions`][require-extensions] is a deprecated feature in Node which
lets projects “hijack” `require` calls to do fancy things, in this case it let’s
you `require` MD(X) files.

## When should I use this?

This integration is useful if you’re using Node, for some reason have to use
CJS, and want to require MDX files from the file system.

At this point in time, you’re better off with `@mdx-js/node-loader`, even though
it uses an experimental Node API.

## Install

This package is [ESM only][esm]:
Node 12+ is needed to use it.

[npm][]:

```sh
npm install @mdx-js/register
```

[yarn][]:

```sh
yarn add @mdx-js/register
```

## Use

Say we have an MDX document, `example.mdx`:

```mdx
export const Thing = () => <>World!</>

# Hello, <Thing />
```

…and our module `example.cjs` looks as follows:

```tsx
'use strict'

const React = require('react')
const {renderToStaticMarkup} = require('react-dom/server')
const Content = require('./example.mdx')

console.log(renderToStaticMarkup(React.createElement(Content)))
```

…then running that with:

```sh
node -r @mdx-js/register example.cjs
```

…yields:

```html
<h1>Hello, World!</h1>
```

## API

> 🪦 **Legacy**: This package is not recommended for use as it depends on
> deprecated Node features.

This package does not export anything.
It changes Node’s internals.

To pass options, you can make your own hook, such as this `my-hook.cjs`:

```tsx
'use strict'

const register = require('@mdx-js/register/lib/index.cjs')

register({/* Options… */})
```

Which can then be used with `node -r ./my-hook.cjs`.

The register hook uses
[`evaluateSync`][eval-sync].
That means `import` (and `export … from`) are not supported when requiring
`.mdx` files.

## Types

This package is not typed as [TypeScript][] seems to not support `.cjs` files
yet.

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

[downloads-badge]: https://img.shields.io/npm/dm/@mdx-js/register.svg

[downloads]: https://www.npmjs.com/package/@mdx-js/register

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

[mit]: https://github.com/mdx-js/mdx/blob/main/packages/register/license

[author]: https://wooorm.com

[require-extensions]: https://nodejs.org/api/modules.html#modules_require_extensions

[eval-sync]: https://mdxjs.com/packages/mdx/#evaluatesyncfile-options

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[security]: https://mdxjs.com/getting-started/#security

[typescript]: https://www.typescriptlang.org
