# `@mdx-js/vue`

[![Build][build-badge]][build]
[![Downloads][downloads-badge]][downloads]
[![Sponsors][sponsors-badge]][opencollective]
[![Backers][backers-badge]][opencollective]
[![Chat][chat-badge]][chat]

Vue renderer for [MDX][]: JSX in Markdown.

## Install

[npm][]:

```sh
npm install @mdx-js/vue
```

[yarn][]:

```sh
yarn add @mdx-js/vue
```

## Use

Say we have the following code in `example.mdx`:

```markdown
# Hello, world! {1 + 1}
```

And our script, `example.jsx`:

```jsx
import Vue from 'vue'
import {MDXProvider} from '@mdx-js/vue'
import Example from './example.mdx'

const components = {
  h1: {
    render(h) {
      return h('h1', {style: {color: 'tomato'}}, this.$slots.default)
    }
  }
}

new Vue({
  el: '#app',
  render(h) {
    return h(MDXProvider, {props: {components}}, Example)
  }
}).$mount()
```

Now, building, bundling, and finally running it, yields:

```html
<div>
  <h1 style="color: tomato;">Hello, world! 2</h1>
</div>
```

Note that you must configure whatever you use to load `.mdx` files to work with
Vue.
That can be done with `@mdx-js/vue-loader` in webpack.

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
[downloads-badge]: https://img.shields.io/npm/dm/@mdx-js/vue.svg
[downloads]: https://www.npmjs.com/package/@mdx-js/vue
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
