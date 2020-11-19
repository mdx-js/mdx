# `@mdx-js/loader`

[![Build][build-badge]][build]
[![Downloads][downloads-badge]][downloads]
[![Sponsors][sponsors-badge]][opencollective]
[![Backers][backers-badge]][opencollective]
[![Chat][chat-badge]][chat]

Webpack loader for [MDX][].

## Install

[npm][]:

```sh
npm install --save-dev @mdx-js/loader
```

[yarn][]:

```sh
yarn add --dev @mdx-js/loader
```

## Use

```js
// …
module: {
  rules: [
    // …
    {
      test: /\.mdx$/,
      use: ['babel-loader', '@mdx-js/loader']
    }
  ]
}
```

You’ll probably want to configure Babel to use `@babel/preset-react` or so, but
that’s not required.

All options given to `mdx-js/loader`, except for `renderer` (see below), are
passed to MDX itself:

```js
// …
{
  test: /\.mdx$/,
  use: [
    // …
    {
      loader: '@mdx-js/loader',
      options: {
        remarkPlugins: [require('remark-slug'), require('remark-toc')],
        rehypePlugins: [require('rehype-autolink-headings')]
      }
    }
  ]
}
```

The `renderer` option specifies a string that is added at the start of the
generated source, so you can use a different `createElement` implementation.
By default, that value is:

```js
import React from 'react'
import {mdx} from '@mdx-js/react'
```

Here a fictional alternative `createElement` is used:

```js
const renderer = `
import {h} from 'generic-implementation'

const mdx = (name, props, ...children) => {
  if (name === 'wrapper') return children.map(createElement)
  if (name === 'inlineCode') return h('code', props, ...children)

  return h(name, props, ...children)
}
`

// …
module: {
  rules: [
    // …
    {
      test: /\.mdx$/,
      use: [
        'babel-loader',
        {
          loader: '@mdx-js/loader',
          options: {
            renderer
          }
        }
      ]
    }
  ]
}
```

For more information on why this is required, see [this post][custom-pragma].

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
[downloads-badge]: https://img.shields.io/npm/dm/@mdx-js/loader.svg
[downloads]: https://www.npmjs.com/package/@mdx-js/loader
[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg
[backers-badge]: https://opencollective.com/unified/backers/badge.svg
[opencollective]: https://opencollective.com/unified
[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg
[chat]: https://github.com/mdx-js/mdx/discussions
[npm]: https://docs.npmjs.com/cli/install
[yarn]: https://yarnpkg.com/cli/add
[contributing]: https://mdxjs.com/contributing
[support]: https://mdxjs.com/support
[coc]: https://github.com/mdx-js/.github/blob/master/code-of-conduct.md
[mit]: license
[compositor]: https://compositor.io
[vercel]: https://vercel.com
[mdx]: https://github.com/mdx-js/mdx
[custom-pragma]: https://mdxjs.com/blog/custom-pragma
