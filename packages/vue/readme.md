# `@mdx-js/vue`

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

Vue context for MDX.

<!-- more -->

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`MDXProvider(props?)`](#mdxproviderprops)
    *   [`useMDXComponents()`](#usemdxcomponents)
*   [Types](#types)
*   [Security](#security)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package is a context based components provider for combining Vue with MDX.

## When should I use this?

This package is not needed for MDX to work with Vue.
But it is nice if you enjoy context-based props passing to avoid repetition.
This package adds support for a Vue context based interface to set components
(sometimes known as *shortcodes*) by passing them to an `MDXProvider`, which
then are used in all nested MDX files implicitly.
The alternative is to pass those components to each MDX file.

## Install

This package is [ESM only][esm]:
Node 12+ is needed to use it and it must be `import`ed instead of `require`d.

[npm][]:

```sh
npm install @mdx-js/vue
```

[yarn][]:

```sh
yarn add @mdx-js/vue
```

## Use

```js
import {MDXProvider} from '@mdx-js/vue'
import {createApp} from 'vue'
import Post from './post.mdx' // Assumes an integration is used to compile MDX -> JS.

createApp({
  data() {
    return {components: {h1: 'h2'}}
  },
  template: '<MDXProvider v-bind:components="components"><Post /></MDXProvider>',
  components: {MDXProvider, Post}
})
```

Note that you don’t have to use `MDXProvider` and can pass components
directly:

```diff
-createApp({
-  data() {
-    return {components: {h1: 'h2'}}
-  },
-  template: '<MDXProvider v-bind:components="components"><Post /></MDXProvider>',
-  components: {MDXProvider, Post}
-})
+createApp(Post, {components})
```

See [¶ Vue in § Getting started][start-vue] for how to get started with MDX and
Vue.
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

Mapping of names for JSX components to React components
(`Record<string, string|Component|Components>`, optional).

##### Returns

Fragment (with the default slot if given).

### `useMDXComponents()`

Get current components from the MDX Context.

###### Returns

`Components`.

## Types

This package is fully typed with [TypeScript][].

An additional `Components` type is exported, which represents the acceptable
configuration for the functions and components from this project.

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

[downloads-badge]: https://img.shields.io/npm/dm/@mdx-js/vue.svg

[downloads]: https://www.npmjs.com/package/@mdx-js/vue

[size-badge]: https://img.shields.io/bundlephobia/minzip/@mdx-js/vue.svg

[size]: https://bundlephobia.com/result?p=@mdx-js/vue

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/mdx-js/mdx/discussions

[npm]: https://docs.npmjs.com/cli/install

[yarn]: https://classic.yarnpkg.com/docs/cli/add/

[contribute]: https://v2.mdxjs.com/community/contribute/

[support]: https://v2.mdxjs.com/community/support/

[coc]: https://github.com/mdx-js/.github/blob/HEAD/code-of-conduct.md

[mit]: https://github.com/mdx-js/mdx/blob/main/packages/vue/license

[vercel]: https://vercel.com

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[start-vue]: https://v2.mdxjs.com/getting-started/#vue

[use-provider]: https://v2.mdxjs.com/using-mdx/#mdx-provider

[security]: https://v2.mdxjs.com/getting-started/#security

[typescript]: https://www.typescriptlang.org
