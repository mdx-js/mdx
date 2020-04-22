# `@mdx-js/loader`

[![Build Status][build-badge]][build]
[![lerna][lerna-badge]][lerna]
[![Join the community on Spectrum][spectrum-badge]][spectrum]

Webpack loader for [MDX][].

## Installation

[npm][]:

```sh
npm i -D @mdx-js/loader
```

## Usage

```js
// ...
module: {
  rules: [
    // ...
    {
      test: /\.mdx?$/,
      use: ['babel-loader', '@mdx-js/loader']
    }
  ]
}
```

The `renderer` option specifies a string that will be prepended to the generated source allowing for the use of any `createElement` implementation. By default, that string is:

```js
import React from 'react'
import {mdx} from '@mdx-js/react'
```

Using the `renderer` option, one can swap out React for another implementation. The example below wraps a generic JSX compatible function named `h`.

```js
const renderer = `
import { h } from 'generic-implementation'

const mdx = (function (createElement) {
  return function (name, props, ...children) {
    if (typeof name === 'string') {
      if (name === 'wrapper') return children.map(createElement)
      if (name === 'inlineCode') return createElement('code', props, ...children)
    }

    return createElement(name, props, ...children)
  }
}(h))
`

// ...
module: {
  rules: [
    // ...
    {
      test: /\.mdx?$/,
      use: [
        'babel-loader',
        {
          loader: '@mdx-js/loader'
          options: {
            renderer,
          }
        }
      ]
    }
  ]
}
```

For more information on why this is required, see [this post](https://mdxjs.com/blog/custom-pragma).

## Contribute

See the [Support][] and [Contributing][] guidelines on the MDX website for ways
to (get) help.

This project has a [Code of Conduct][coc].
By interacting with this repository, organisation, or community you agree to
abide by its terms.

## License

[MIT][] © [Compositor][] and [Vercel][]

<!-- Definitions -->

[build]: https://travis-ci.com/mdx-js/mdx
[build-badge]: https://travis-ci.com/mdx-js/mdx.svg?branch=master
[lerna]: https://lernajs.io/
[lerna-badge]: https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg
[spectrum]: https://spectrum.chat/mdx
[spectrum-badge]: https://withspectrum.github.io/badge/badge.svg
[contributing]: https://mdxjs.com/contributing
[support]: https://mdxjs.com/support
[coc]: https://github.com/mdx-js/.github/blob/master/code-of-conduct.md
[mit]: license
[compositor]: https://compositor.io
[vercel]: https://vercel.com
[mdx]: https://github.com/mdx-js/mdx
[npm]: https://docs.npmjs.com/cli/install
