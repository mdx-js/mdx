# remark-mdx

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

remark plugin to support the MDX syntax (JSX, expressions, import/exports).

<!-- more -->

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`unified().use(remarkMdx)`](#unifieduseremarkmdx)
*   [Syntax](#syntax)
*   [Syntax tree](#syntax-tree)
*   [Types](#types)
*   [Security](#security)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package is a remark plugin to support the MDX syntax.

## When should I use this?

This plugin is useful if you’re dealing with the MDX syntax and integrating
with remark, rehype, and the rest of unified.
Some example use cases are when you want to lint the syntax or compile it to
something other that JavaScript.

**remark** is an AST (abstract syntax tree) based transform project.
The layer under remark is called mdast, which is just the syntax tree without
the convention on how to transform.
mdast is useful when transforming to other formats.
Another layer underneath is micromark, which is just the parser and has support
for concrete tokens.
micromark is useful for linting and formatting.
`remark-mdx` is a small wrapper to integrate all of these.
Its parts can be used separately.

Typically though, you’d want to move a layer up: `@mdx-js/mdx`.
That package is the core compiler for turning MDX into JavaScript which
gives you the most control.
Or even higher: if you’re using a bundler (webpack, Rollup, esbuild), or a site
builder (Gatsby, Next.js) or build system (Vite, WMR) which comes with a
bundler, you’re better off using an integration: see
[§ Integrations][integrations].

## Install

This package is [ESM only][esm]:
Node 12+ is needed to use it and it must be `import`ed instead of `require`d.

[npm][]:

```sh
npm install remark-mdx@next
```

[yarn][]:

```sh
yarn add remark-mdx@next
```

## Use

```js
import {remark} from 'remark'
import remarkMdx from 'remark-mdx'

const file = remark()
  .use(remarkMdx)
  .processSync('import a from "b"\n\na <b /> c {1 + 1} d')

console.log(String(file))
```

Yields:

```mdx
import a from "b"

a <b/> c {1 + 1} d
```

## API

This package exports no identifiers.
The default export is `remarkMdx`.

### `unified().use(remarkMdx)`

Configures remark so that it can parse and serialize MDX (JSX, expressions,
import/exports).
It doesn’t do anything with the syntax: you can
[create your own plugin][create-plugin] to transform them.

## Syntax

This plugin applies several micromark extensions to parse the syntax.
See their readmes for parse details:

*   [`micromark-extension-mdx-expression`](https://github.com/micromark/micromark-extension-mdx-expression#syntax)
    — expressions (`{1 + 1}`)
*   [`micromark-extension-mdx-jsx`](https://github.com/micromark/micromark-extension-mdx-jsx#syntax)
    — JSX (`<div />`)
*   [`micromark-extension-mdxjs-esm`](https://github.com/micromark/micromark-extension-mdxjs-esm#syntax)
    — ESM (`export x from 'y'`)
*   [`micromark-extension-mdx-md`](https://github.com/micromark/micromark-extension-mdx-md#mdxmd)
    — Turn off HTML, autolinks, and indented code

## Syntax tree

This plugin applies several mdast utilities to build and serialize the AST.
See their readmes for the node types supported in the tree:

*   [`mdast-util-mdx-expression`](https://github.com/syntax-tree/mdast-util-mdx-expression#syntax-tree)
    — expressions (`{1 + 1}`)
*   [`mdast-util-mdx-jsx`](https://github.com/syntax-tree/mdast-util-mdx-jsx#syntax-tree)
    — JSX (`<div />`)
*   [`mdast-util-mdxjs-esm`](https://github.com/syntax-tree/mdast-util-mdxjs-esm#syntax-tree)
    — ESM (`export x from 'y'`)

## Types

This package is fully typed with [TypeScript][].

If you’re working with the syntax tree, make sure to import this plugin
somewhere in your types, as that registers the new node types in the tree.

```js
/**
 * @typedef {import('remark-mdx')}
 */

import {visit} from 'unist-util-visit'

export default function myRemarkPlugin() => {
  /** @param {import('@types/mdast').Root} tree */
  return (tree) => {
    visit(tree, (node) => {
      // `node` can now be one of the nodes for JSX, expressions, or ESM.
    })
  }
}
```

Alternatively, in TypeScript, do:

```ts
/// <reference types="remark-mdx" />

import type {Root} from '@types/mdast'
import {visit} from 'unist-util-visit'

export default function myRemarkPlugin() => {
  return (tree: Root) => {
    visit(tree, (node) => {
      // `node` can now be one of the nodes for JSX, expressions, or ESM.
    })
  }
}
```

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

[downloads-badge]: https://img.shields.io/npm/dm/remark-mdx.svg

[downloads]: https://www.npmjs.com/package/remark-mdx

[size-badge]: https://img.shields.io/bundlephobia/minzip/remark-mdx.svg

[size]: https://bundlephobia.com/result?p=remark-mdx

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/mdx-js/mdx/discussions

[npm]: https://docs.npmjs.com/cli/install

[yarn]: https://classic.yarnpkg.com/docs/cli/add/

[contribute]: https://mdxjs.com/community/contribute/

[support]: https://mdxjs.com/community/support/

[coc]: https://github.com/mdx-js/.github/blob/HEAD/code-of-conduct.md

[mit]: https://github.com/mdx-js/mdx/blob/main/packages/remark-mdx/license

[author]: https://wooorm.com

[create-plugin]: https://unifiedjs.com/learn/guide/create-a-plugin/

[integrations]: https://mdxjs.com/getting-started/#integrations

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[security]: https://mdxjs.com/getting-started/#security

[typescript]: https://www.typescriptlang.org
