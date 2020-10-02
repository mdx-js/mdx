# `@mdx-js/vue-loader`

[![Build Status][build-badge]][build]
[![lerna][lerna-badge]][lerna]
[![Chat][chat-badge]][chat]

Transform your MDX files into Vue components.

`@mdx-js/vue-loader` is a webpack loader for [MDX][] files for Vue.js.

## Installation

[npm][]:

```sh
npm i @mdx-js/vue-loader
```

In your webpack config:

```js
// ...
module: {
  rules: [
    // ...
    {
      test: /\.mdx?$/,
      use: ['babel-loader', '@mdx-js/vue-loader']
    }
  ]
}
```

## Usage

In your Markdown file:

```markdown
<!-- helloworld.md -->

# Hello, Vue!
```

In your `main.js`:

```jsx
import Vue from 'vue'
import HelloWorld from 'helloworld.md'

new Vue({
  el: '#app',
  render: h => h(HelloWorld)
}).$mount()
```

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
[lerna]: https://lerna.js.org/
[lerna-badge]: https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg
[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg
[chat]: https://github.com/mdx-js/mdx/discussions
[contributing]: https://mdxjs.com/contributing
[support]: https://mdxjs.com/support
[coc]: https://github.com/mdx-js/.github/blob/master/code-of-conduct.md
[mit]: license
[compositor]: https://compositor.io
[vercel]: https://vercel.com
[mdx]: https://github.com/mdx-js/mdx
[npm]: https://docs.npmjs.com/cli/install
