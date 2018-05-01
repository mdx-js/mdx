![Logo](./.github/repo.png)

[![Build Status](https://travis-ci.org/mdx-js/mdx.svg?branch=master)](https://travis-ci.org/mdx-js/mdx)
[![Join the community on Spectrum](https://withspectrum.github.io/badge/badge.svg)](https://spectrum.chat/mdx)

MDX is a JSX in Markdown loader, parser, and renderer for ambitious projects.
It combines the readability of Markdown with the expressivity of JSX.
The best of both worlds. :globe_with_meridians:

[See the MDX specification](https://github.com/mdx-js/specification)

## Features

- Fast
- No runtime compilation
- [Pluggable](https://github.com/remarkjs/remark/blob/master/doc/plugins.md)
- Element to React component mapping
- React component `import`/`export`
- Simpler image syntax
- Webpack loader

## Installation

```sh
npm install --save @mdx-js/mdx
npm install --save-dev @mdx-js/loader
```

> Note: mdx requires a version of node that is >= `v8.5`

### Configuring with webpack

You'll need to specify the `@mdx-js/loader` webpack loader and follow it with the `babel-loader`:

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.md$/,
        use: ['babel-loader', '@mdx-js/loader']
      }
    ]
  }
}
```

<p>
  <details>
    <summary><b>Examples</b></summary>
    <ul>
      <li>
        <a href="./examples/next"><code>next.js</code></a>
      </li>
      <li>
        <a href="./examples/x0"><code>x0</code></a>
      </li>
    </ul>
  </details>
</p>

## Usage

Create an md file, `hello.md`:

```jsx
# Hello, world!
```

And import it from a component, `pages/index.js`:

```jsx
import React from 'react'
import Hello from '../hello.md'

export default () => <Hello />
```

## MDX syntax

### Imports

Similarly to JSX, components can be rendered after an `import`:

```jsx
import Graph from './components/graph'

## Here's a graph

<Graph />
```

#### Markdown file transclusion

You can transclude Markdown files by importing one `.md` file into another:

```jsx
import License from './license.md'
import Contributing from './docs/contributing.md'

# Hello, world!

<License />

---

<Contributing />
```

### Exports

You can use exports to export metadata like layout or authors.
It's a mechanism for an imported MDX file to communicate with its parent.
It works similarly to frontmatter, but uses ES2015 syntax.

```js
import { fred, sue } from '../data/authors'
import Layout from '../components/with-blog-layout'

export const meta = {
  authors: [fred, sue],
  layout: Layout
}
```

### Component customization

You can pass in components for any `html` element that Markdown compiles to.
This allows you to use your existing components and use CSS-in-JS like `styled-components`.

```jsx
import React from 'react'
import Hello from '../hello.md'

import {
  Text,
  Heading,
  Code,
  InlineCode
} from '../ui'

export default () =>
  <Hello
    components={{
      h1: Heading,
      p: Text,
      code: Code,
      inlineCode: InlineCode
    }}
  />
```

## Plugins

Since MDX uses the [remark](https://github.com/remarkjs/remark)/[rehype](https://github.com/rehypejs/rehype) ecosystems, you can use plugins to modify the AST at different stages of the transpilation process.

If you look at the [next example](https://github.com/mdx-js/mdx/blob/master/examples/next/next.config.js#L3), it shows you to pass plugins as options to the [MDX loader](https://github.com/mdx-js/mdx/tree/master/packages/loader).

### Options

Name | Type | Required | Description
---- | ---- | -------- | -----------
`mdPlugins` | Array[] | `false` | Array of remark plugins to manipulate the MDXAST
`hastPlugins` | Array[] | `false` | Array of rehype plugins to manipulate the MDXHAST

## Sync API

If you're using the MDX library directly, you might want to process an MDX string synchronously.

```js
const jsx = mdx.sync('# Hello, world!')
```

## Related

[See the related projects in the MDX specification](https://github.com/mdx-js/specification#related)

## Authors

- John Otander ([@4lpine](https://twitter.com/4lpine)) – [Compositor](https://compositor.io) + [Clearbit](https://clearbit.com)
- Tim Neutkens ([@timneutkens](https://github.com/timneutkens)) – [ZEIT](https://zeit.co)
- Guillermo Rauch ([@rauchg](https://twitter.com/rauchg)) – [ZEIT](https://zeit.co)
- Brent Jackson ([@jxnblk](https://twitter.com/jxnblk)) – [Compositor](https://compositor.io)
