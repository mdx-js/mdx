# `@mdx-js/vue`

[![Build Status][build-badge]][build]
[![lerna][lerna-badge]][lerna]
[![Chat][chat-badge]][chat]

`@mdx-js/vue` works together with the `@mdx-js/vue-loader` to map Vue components to HTML elements based on the Markdown syntax.

This module also exports the `MDXProvider` that accepts an object with a map of all components you to be rendered in the HTML.

## Installation

```bash
npm install --save @mdx-js/vue
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
import { MDXProvider } from '@mdx-js/vue'
import HelloWorld from 'helloworld.md'

const components: {
  h1: props => ({
    render(h) {
      return (
        <h1 style={{ color: 'tomato' }} {...props} >
          {this.$slots.default}
        </h1>
      )
    }
  })
}

new Vue({
  el: '#app',
  render(h) {
    return (
      <MDXProvider components={components}>
        <HelloWorld />
      </MDXProvider>
    )
  }
}).$mount()
```

Yields:

```html
<h1 style="color:tomato">Hello, Vue!</h1>
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
