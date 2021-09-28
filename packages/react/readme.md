# `@mdx-js/react`

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

React context for MDX.

## Contents

*   [Install](#install)
*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Use](#use)
*   [API](#api)
    *   [`MDXProvider(props?)`](#mdxproviderprops)
    *   [`useMDXComponents(components?)`](#usemdxcomponentscomponents)
    *   [`MDXContext`](#mdxcontext)
    *   [`withMDXComponents(Component)`](#withmdxcomponentscomponent)
*   [Contribute](#contribute)
*   [License](#license)

## Install

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c):
Node 12+ is needed to use it and it must be `import`ed instead of `require`d.

[npm][]:

```sh
npm install @mdx-js/react
```

[yarn][]:

```sh
yarn add @mdx-js/react
```

## What is this?

This package is a context based components provider for combining React with
MDX.

## When should I use this?

This package is not needed for MDX to work with React.

But it is nice if you enjoy context-based props passing to avoid some
repetition.
This package adds support for a React context based interface to set components
(sometimes known as *shortcodes*) by passing them to an `MDXProvider`, which
then are used in all nested MDX file implicitly.
The alternative is to pass those components to each MDX file.

It can be used by:

*   configuring your integration to use `@mdx-js/react` as a provider
*   wrapping your MDX content in an `<MDXProvider components={…} />`.

## Use

```js
import {MDXProvider} from '@mdx-js/react'
import Post from './post.mdx' // Assumes an integration is used to compile MDX -> JS.

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

## API

This package exports the following identifiers: `MDXContext`, `MDXProvider`,
`useMDXComponents`, and `withMDXComponents`.
There is no default export.

### `MDXProvider(props?)`

Provider for MDX context.

##### `props`

Configuration (`Object`, optional).

###### `props.components`

Mapping of names for JSX components to React components
(`Record<string, string|Component|Components>`, optional).

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

### `MDXContext`

> 🪦 **Deprecated**: This export is not recommended for use as it exposes
> internals which should be hidden.
> It might be removed in a future major release.
> Please use `useMDXComponents` to get context based components and
> `MDXProvider` to set context based components instead.

The React Context for MDX (`React.Context`).

### `withMDXComponents(Component)`

> 🪦 **Deprecated**: This export is not recommended for use.
> It might be removed in a future major release.
> Please use `useMDXComponents` to get context based components instead.

Create a HOC of `Components` which is given the current context based MDX
components.

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

[downloads-badge]: https://img.shields.io/npm/dm/@mdx-js/react.svg

[downloads]: https://www.npmjs.com/package/@mdx-js/react

[size-badge]: https://img.shields.io/bundlephobia/minzip/@mdx-js/react.svg

[size]: https://bundlephobia.com/result?p=@mdx-js/react

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
