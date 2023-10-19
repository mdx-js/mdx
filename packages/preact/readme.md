# `@mdx-js/preact`

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

Preact context for MDX.

<!-- more -->

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`MDXProvider(props?)`](#mdxproviderprops)
    *   [`useMDXComponents(components?)`](#usemdxcomponentscomponents)
*   [Types](#types)
*   [Security](#security)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package is a context based components provider for combining Preact with
MDX.

## When should I use this?

This package is not needed for MDX to work with Preact.
See [¶ MDX provider in § Using MDX][use-provider] for when and how to use an MDX
provider.

## Install

This package is [ESM only][esm]:
Node 12+ is needed to use it and it must be `import`ed instead of `require`d.

[npm][]:

```sh
npm install @mdx-js/preact
```

[yarn][]:

```sh
yarn add @mdx-js/preact
```

## Use

```tsx
import {MDXProvider} from '@mdx-js/preact'
import Post from './post.mdx'
// ^-- Assumes an integration is used to compile MDX to JS, such as
// `@mdx-js/esbuild`, `@mdx-js/loader`, `@mdx-js/node-loader`, or
// `@mdx-js/rollup`, and that it is configured with
// `options.providerImportSource: '@mdx-js/preact'`.

const components = {
  em: props => <i {...props} />
}

<MDXProvider components={components}>
  <Post />
</MDXProvider>
```

Note that you don’t have to use `MDXProvider` and can pass components
directly:

```diff
-<MDXProvider components={components}>
-  <Post />
-</MDXProvider>
+<Post components={components} />
```

See [¶ Preact in § Getting started][start-preact] for how to get started with
MDX and Preact.
See [¶ MDX provider in § Using MDX][use-provider] for how to use an MDX
provider.

## API

This package exports the following identifiers: `MDXProvider` and
`useMDXComponents`.
There is no default export.

### `MDXProvider(props?)`

Provider for MDX context.

##### `props`

Configuration (`Object`, optional).

###### `props.components`

Mapping of names for JSX components to Preact components
(`Record<string, string | Component | Components>`, optional).

###### `props.disableParentContext`

Turn off outer component context (`boolean`, default: `false`).

###### `props.children`

Children (JSX elements, optional).

##### Returns

JSX element.

### `useMDXComponents(components?)`

Get current components from the MDX Context.

###### `components`

Additional components (`Components`) to use or a function that takes the current
components and filters/merges/changes them (`(currentComponents: Components) =>
Components`).

###### Returns

`Components`.

## Types

This package is fully typed with [TypeScript][].

To enable types for imported `.mdx`, `.md`, etcetera files, you should make sure
the TypeScript `JSX` namespace is typed.
This is done by installing and using the types of your framework, as in
[`preact`](https://github.com/preactjs/preact).
Then you can install and use
[`@types/mdx`](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/HEAD/types/mdx),
which adds types to import statements of supported files.

## Security

See [§ Security][security] on our website for information.

## Contribute

See [§ Contribute][contribute] on our website for ways to get started.
See [§ Support][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][] © Compositor and [Vercel][]

[build-badge]: https://github.com/mdx-js/mdx/workflows/main/badge.svg

[build]: https://github.com/mdx-js/mdx/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/mdx-js/mdx/main.svg

[coverage]: https://codecov.io/github/mdx-js/mdx

[downloads-badge]: https://img.shields.io/npm/dm/@mdx-js/preact.svg

[downloads]: https://www.npmjs.com/package/@mdx-js/preact

[size-badge]: https://img.shields.io/bundlephobia/minzip/@mdx-js/preact.svg

[size]: https://bundlephobia.com/result?p=@mdx-js/preact

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

[mit]: https://github.com/mdx-js/mdx/blob/main/packages/preact/license

[vercel]: https://vercel.com

[start-preact]: https://mdxjs.com/getting-started/#preact

[use-provider]: https://mdxjs.com/docs/using-mdx/#mdx-provider

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[security]: https://mdxjs.com/getting-started/#security

[typescript]: https://www.typescriptlang.org
