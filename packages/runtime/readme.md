# `@mdx-js/runtime`

[![Build][build-badge]][build]
[![Downloads][downloads-badge]][downloads]
[![Sponsors][sponsors-badge]][opencollective]
[![Backers][backers-badge]][opencollective]
[![Chat][chat-badge]][chat]

A [React][] component that evaluates [MDX][].

> :warning: **warning**: this is not the preferred way to use MDX since it
> introduces a substantial amount of overhead and dramatically increases
> bundle sizes.
> It must not be used with user input that isn’t sandboxed.

## Install

[npm][]:

```sh
npm install @mdx-js/runtime
```

[yarn][]:

```sh
yarn add @mdx-js/runtime
```

## Use

Say we have the following scripts, `example.jsx`:

### Props

The MDX Runtime component accepts two props:

| Name            | Description                                                      |
| --------------- | ---------------------------------------------------------------- |
| `components`    | Globally available components for the runtime                    |
| `scope`         | Variables that are accessible in the JSX portion of the document |
| `remarkPlugins` | Array of remark plugins                                          |

### Example code

```jsx
import React from 'react'
import {renderToString} from 'react-dom/server'
import MDX from '@mdx-js/runtime'

// Custom components:
const components = {
  h1: props => <h1 style={{color: 'tomato'}} {...props} />,
  Demo: () => <p>This is a demo component</p>
}

// Data available in MDX:
const scope = {
  somethingInScope: 1
}

// The MDX:
const children = `
# Hello, world!

{1 + somethingInScope}

<Demo />

<div>Here is the scope variable: {some}</div>
`

const result = renderToString(
  <MDX components={components} scope={scope} children={children} />
)

console.log(result)
```

Now, building, bundling, and finally running it, yields:

```html
<h1 style="color:tomato">Hello, world!</h1>
2
<p>This is a demo component</p>
```

## Contribute

See [Contributing on `mdxjs.com`][contributing] for ways to get started.
See [Support][] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][] © [Compositor][] and [Vercel][]

[build-badge]: https://github.com/mdx-js/mdx/workflows/CI/badge.svg
[build]: https://github.com/mdx-js/mdx/actions
[downloads-badge]: https://img.shields.io/npm/dm/@mdx-js/runtime.svg
[downloads]: https://www.npmjs.com/package/@mdx-js/runtime
[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg
[backers-badge]: https://opencollective.com/unified/backers/badge.svg
[opencollective]: https://opencollective.com/unified
[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg
[chat]: https://github.com/mdx-js/mdx/discussions
[mdx]: https://mdxjs.com
[npm]: https://docs.npmjs.com/cli/install
[yarn]: https://yarnpkg.com/cli/add
[contributing]: https://mdxjs.com/contributing
[support]: https://mdxjs.com/support
[coc]: https://github.com/mdx-js/.github/blob/master/code-of-conduct.md
[mit]: license
[compositor]: https://compositor.io
[vercel]: https://vercel.com
[react]: https://reactjs.org
