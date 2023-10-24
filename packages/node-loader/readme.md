# `@mdx-js/node-loader`

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

Node.js hooks (also knows as loaders) for MDX.

<!-- more -->

## Contents

* [What is this?](#what-is-this)
* [When should I use this?](#when-should-i-use-this)
* [Install](#install)
* [Use](#use)
* [API](#api)
  * [`createLoader(options?)`](#createloaderoptions)
  * [`load`](#load)
  * [`Options`](#options)
* [Types](#types)
* [Compatibility](#compatibility)
* [Security](#security)
* [Contribute](#contribute)
* [License](#license)

## What is this?

This package contains Node.js hooks to add support for importing MDX files.
Node *Customization Hooks* are currently a release candidate.

## When should I use this?

This integration is useful if you’re using Node and want to import MDX files
from the file system.

If you’re using a bundler (webpack, Rollup, esbuild), or a site builder
(Next.js) or build system (Vite) which comes with a bundler, you can instead
another integration: see [§ Integrations][integrations].

## Install

This package is [ESM only][esm].
In Node.js (version 16+), install with [npm][]:

```sh
npm install @mdx-js/node-loader
```

## Use

Say we have an MDX document, `example.mdx`:

```mdx
export function Thing() {
  return <>World!</>
}

# Hello, <Thing />
```

…and our module `example.js` looks as follows:

```tsx
import {renderToStaticMarkup} from 'react-dom/server'
import React from 'react'
import Content from './example.mdx'

console.log(renderToStaticMarkup(React.createElement(Content)))
```

…then running with:

```sh
node --loader=@mdx-js/node-loader example.js
```

…yields:

```html
<h1>Hello, World!</h1>
```

> **Note**: if you use Node 18 and lower, then you can ignore the following
> warning:
>
> ```txt
> (node:20718) ExperimentalWarning: Custom ESM Loaders is an experimental feature and might change at any > time
> (Use `node --trace-warnings ...` to show where the warning was created)
> ```

> **Note**: if you use Node 20 and higher, then you get the following warning:
>
> ```txt
> (node:20908) ExperimentalWarning: `--experimental-loader` may be removed in the future; instead use > `register()`:
> --import 'data:text/javascript,import { register } from "node:module"; import { pathToFileURL } from > "node:url"; register("%40mdx-js/node-loader", pathToFileURL("./"));'
> ```
>
> You can solve that by adding a `register.js` file:
>
> ```tsx
> import {register} from 'node:module'
>
> register('@mdx-js/node-loader', import.meta.url)
> ```
>
> …and running `node --import ./register.js example.js` instead.

## API

This package export the identifiers [`createLoader`][api-create-loader] and
[`load`][api-load].
There is no default export.

### `createLoader(options?)`

Create Node.js hooks to handle markdown and MDX.

###### Parameters

* `options` ([`Options`][api-options], optional)
  — configuration

###### Returns

Node.js hooks ([`{load}`][api-load]).

### `load`

Load `file:` URLs to MD(X) files.

See [`load` in Node.js docs][node-load] for more info.

### `Options`

Configuration (TypeScript type).

Options are the same as [`CompileOptions` from `@mdx-js/mdx`][compile-options]
with the exception that the `development` option is supported based on how you
configure webpack.
You cannot pass it manually.

## Types

This package is fully typed with [TypeScript][].
It exports the additional type [`Options`][api-options].
See [§ Types][types] on our website for information.

## Compatibility

Projects maintained by the unified collective are compatible with maintained
versions of Node.js.

When we cut a new major release, we drop support for unmaintained versions of
Node.
This means we try to keep the current release line, `@mdx-js/node-loader@^3`,
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

[downloads-badge]: https://img.shields.io/npm/dm/@mdx-js/node-loader.svg

[downloads]: https://www.npmjs.com/package/@mdx-js/node-loader

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/mdx-js/mdx/discussions

[npm]: https://docs.npmjs.com/cli/install

[contribute]: https://mdxjs.com/community/contribute/

[support]: https://mdxjs.com/community/support/

[coc]: https://github.com/mdx-js/.github/blob/main/code-of-conduct.md

[mit]: https://github.com/mdx-js/mdx/blob/main/packages/node-loader/license

[author]: https://wooorm.com

[integrations]: https://mdxjs.com/getting-started/#integrations

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[types]: https://mdxjs.com/getting-started/#types

[security]: https://mdxjs.com/getting-started/#security

[typescript]: https://www.typescriptlang.org

[compile-options]: https://mdxjs.com/packages/mdx/#compileoptions

[node-load]: https://nodejs.org/api/module.html#loadurl-context-nextload

[api-create-loader]: #createloaderoptions

[api-load]: #load

[api-options]: #options
