# MDX [![Build Status][build-badge]][build]

__Please note this repo is in active development. Things are likely to change. Use at your own risk <3.__

It's currently tracking an evolving spec defined by:

- [MDX](MDX_SPECIFICATION.md)
- [MDXAST](MDXAST_SPECIFICATION.md)

---

A fully-featured MDX parser and renderer for ambitious projects.
Compiles to JSX for React-based apps or static site generation.
Built with [`remark`](https://github.com/remarkjs/remark) and adapted from [`remark-react`](https://github.com/mapbox/remark-react)/[`mdxc`](https://github.com/jamesknelson/mdxc).

MDX provides a few added features that improve the Markdown spec, including component imports, object exporting, inline JSX, and an optional image syntax.

```sh
npm install --save @mdx-js/mdx
```

## Features

- Fast
- [Pluggable](https://github.com/remarkjs/remark/blob/master/doc/plugins.md)
- Element to React component mapping
- React component `import`/`export`
- Simpler image syntax
- Webpack loader
- GitHub style emojis

## Component customization

You can pass in components for any `html` element that the markdown compiles to.
This allows you to use your existing components and use CSS-in-JS like `styled-components`.

```jsx
import React from 'react'
import { Markdown } from '@compositor/markdown'

const Heading = props =>
  <h1
    style={{ color: 'tomato' }}
    {...props}
  />

export default () =>
  <Markdown
    text='# Hello, world!'
    components={{ h1 }}
  />
```

## Syntax

In addition supporting the full Markdown spec, this project adds syntactic niceties and plugin options.

#### Render components

Similarly to JSX, components can be rendered after an import.

```jsx
import Graph from './components/graph'

## Here's a graph

<Graph />
```

#### Compose markdown files

If you have markdown that's repeated throughout multiple documents, make them standalone, importing them into the desired documents when needed.

```jsx
import License from './docs/license.md'
import Contributing from './docs/contributing.md'

# Hello, world!

This is an example markdown document.

<License />

***

<Contributing />
```

#### Images

Embedding images is easier to remember, you can simply link a url.

```md
#### A url

Below will render an image:

https://c8r-x0.s3.amazonaws.com/lab-components-macbook.jpg
```

##### Supported file types

- `png`
- `svg`
- `jpg`

## Usage

You can use this library in a few different ways depending on what makes most sense for your project.

### Import with loader

```jsx
import { Layout } from './ui'

import Document from './docs/getting-started.md'

export default () =>
  <Layout>
    <Document />
  </Layout>
```

#### Component

```jsx
import { Markdown } from '@compositor/markdown'

export default () =>
  <Markdown text='# Hello, world!' />
```

#### Core library usage

The library accepts a markdown string, and an options object.

```js
const fs = require('fs')
const { md } = require('@compositor/markdown')

const doc = fs.readFileSync('file.md', 'utf8')
const ui = require('./ui')

const reactComponents = md(doc, {
  components: {
    h1: ui.H1,
    p: ui.Text,
    code: ui.Code,
    ...ui
  }
})
```

#### Options

| Name | Default | Description |
| ---- | ------- | ----------- |
| `components` | `{}` | Object containing html element to component mapping and any other components to provide to the global scope |
| `plugins` | `[]` | Additional remark plugins |

## Related

- [markdown](https://daringfireball.net/projects/markdown/syntax)
- [unified](https://github.com/unifiedjs/unified)
- [remark](http://remark.js.org/)
- [remark-jsx](https://github.com/fazouane-marouane/remark-jsx)
- [remark-react](https://github.com/mapbox/remark-react)
- [mdxc](https://github.com/jamesknelson/mdxc)
- [remark-toc](https://github.com/remarkjs/remark-toc)
- [remark-emoji](https://github.com/rhysd/remark-emoji)
- [IA Markdown Content Blocks](https://github.com/iainc/Markdown-Content-Blocks)
- [.mdx proposal](https://spectrum.chat/thread/1021be59-2738-4511-aceb-c66921050b9a)
- [MDXAST proposal](https://github.com/syntax-tree/ideas/issues/3)

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

***

[Made by Compositor](https://compositor.io/)
|
[MIT License](license)

[build-badge]: https://img.shields.io/travis/c8r/markdown/master.svg?style=flat-square
[build]: https://travis-ci.org/c8r/markdown
