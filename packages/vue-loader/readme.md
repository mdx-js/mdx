# `@mdx-js/vue-loader`

[![Build][build-badge]][build]
[![Downloads][downloads-badge]][downloads]
[![Sponsors][sponsors-badge]][opencollective]
[![Backers][backers-badge]][opencollective]
[![Chat][chat-badge]][chat]

Webpack loader for [MDX][] with [Vue][].

## Install

[npm][]:

```sh
npm install --save-dev @mdx-js/vue-loader
```

[yarn][]:

```sh
yarn add --dev @mdx-js/vue-loader
```

## Use

```js
// …
module: {
  rules: [
    // …
    {
      test: /\.mdx$/,
      use: ['babel-loader', '@mdx-js/vue-loader']
    }
  ]
}
```

You’ll probably want to configure Babel to use `babel-plugin-transform-vue-jsx`
or so.

All options given to `mdx-js/vue-loader` are passed to MDX itself:

```js
// …
{
  test: /\.mdx$/,
  use: [
    // …
    {
      loader: '@mdx-js/vue-loader',
      options: {
        remarkPlugins: [require('remark-slug'), require('remark-toc')],
        rehypePlugins: [require('rehype-autolink-headings')]
      }
    }
  ]
}
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
[downloads-badge]: https://img.shields.io/npm/dm/@mdx-js/vue-loader.svg
[downloads]: https://www.npmjs.com/package/@mdx-js/vue-loader
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
[vue]: https://vuejs.org
