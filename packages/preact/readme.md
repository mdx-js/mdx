# `@mdx-js/preact`

[![Build][build-badge]][build]
[![Downloads][downloads-badge]][downloads]
[![Sponsors][sponsors-badge]][opencollective]
[![Backers][backers-badge]][opencollective]
[![Chat][chat-badge]][chat]

Preact renderer for [MDX][]: JSX in Markdown.

## Install

[npm][]:

```sh
npm install @mdx-js/preact
```

[yarn][]:

```sh
yarn add @mdx-js/preact
```

## Use

Say we have the following code in `example.mdx`:

```markdown
# Hello, world! {1 + 1}
```

And our script, `example.jsx`:

```jsx
/* @jsx h */
import {h} from 'preact'
import {MDXProvider} from '@mdx-js/preact'
import {render} from 'preact-render-to-string'

import Example from './example.mdx'

const h1 = props => <h1 style={{color: 'tomato'}} {...props} />

console.log(
  render(
    <MDXProvider components={{h1}}>
      <Example />
    </MDXProvider>
  )
)
```

Now, building, bundling, and finally running it, yields:

```html
<h1 style="color: tomato;">Hello, world! 2</h1>
```

Note that you must configure whatever you use to load `.mdx` files to use `mdx`
from `@mdx-js/preact`, such as with the webpack loader:

```js
// …
{
  loader: '@mdx-js/loader',
  options: {renderer: `import {mdx} from '@mdx-js/preact'`}
}
// …
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

[downloads-badge]: https://img.shields.io/npm/dm/@mdx-js/preact.svg

[downloads]: https://www.npmjs.com/package/@mdx-js/preact

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
