# `@mdx-js/node-loader`

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

> 💡 **Experiment**: this is an experimental package that might not work
> well and might change in minor releases.

Node loader for MDX.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`createLoader(options?)`](#createloaderoptions)
*   [Types](#types)
*   [Security](#security)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package is a Node ESM loader to support MDX.
[ESM loaders][loader] are an experimental feature in Node, slated to change.
They let projects “hijack” imports to do all sorts of fancy things, in this
case it let’s you `import` MD(X) files.

## When should I use this?

This integration is useful if you’re using Node and want to import MDX files
from the file system.

If you’re using a bundler (webpack, rollup, esbuild), or a site builder (gatsby,
next) or build system (vite, snowpack) which comes with a bundler, you’re better
off using another integration: see [§ Integrations](#).

## Install

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c):
Node 12+ is needed to use it and it must be `import`ed instead of `require`d.

[npm][]:

```sh
npm install @mdx-js/node-loader
```

[yarn][]:

```sh
yarn add @mdx-js/node-loader
```

## Use

Say we have an MDX document, `example.mdx`:

```mdx
export const Thing = () => <>World!</>

# Hello, <Thing />
```

…and our module `example.js` looks as follows:

```js
import {renderToStaticMarkup} from 'react-dom/server.js'
import React from 'react'
import Content from './example.mdx'

console.log(renderToStaticMarkup(React.createElement(Content)))
```

…then running that with:

```sh
node --experimental-loader=@mdx-js/node-loader example.js
```

…yields:

```html
<h1>Hello, World!</h1>
```

## API

> 💡 **Experiment**: this is an experimental package that might not work
> well and might change in minor releases.

This package exports a Node [ESM loader][loader].
It also exports the following identifier: `createLoader`.

### `createLoader(options?)`

Create a Node ESM loader to compile MDX to JS.

###### `options`

`options` are the same as [`compile`](#) from `@mdx-js/mdx`.

###### Example

`my-loader.js`:

```js
import {createLoader} from '@mdx-js/node-loader'

const {getFormat, transformSource} = createLoader(/* Options… */)

export {getFormat, transformSource}
```

This example can then be used with `node --experimental-loader=my-loader.js`.

Node itself does not yet support multiple loaders but it is possible to combine
multiple loaders with
[`@node-loader/core`](https://github.com/node-loader/node-loader-core).

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

See [§ Security](#) on our website for information.

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

[npm]: https://docs.npjs.com/cli/install

[yarn]: https://classic.yarnpkg.com/docs/cli/add/

[contribute]: https://v2.mdxjs.com/contributing/

[support]: https://v2.mdxjs.com/support/

[coc]: https://github.com/mdx-js/.github/blob/master/code-of-conduct.md

[mit]: license

[author]: https://wooorm.com

[loader]: https://nodejs.org/api/esm.html#esm_loaders
