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
npm install --save-dev @mdx-js/loader @mdx-js/mdx
```

> Note: mdx requires a version of node that is >= `v8.5`

### Configuring with Webpack

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

### Configuring with Parcel

You'll need to install the `@mdx-js/parcel-plugin-mdx` plugin to transpile MDX.

```js
{
  "scripts": {
    "start": "parcel index.html --no-cache"
  },
  "dependencies": {
    "react": "16.4.1",
    "react-dom": "16.4.1",
    "@mdx-js/tag": "latest"
  },
  "devDependencies": {
    "@mdx-js/parcel-plugin-mdx": "latest",
    "parcel-bundler": "1.9.0"
  }
}
```

<p>
  <details>
    <summary><b>Examples</b></summary>
    <ul>
      <li>
        <a href="./examples/parcel"><code>Parcel</code></a>
      </li>
    </ul>
  </details>
</p>

### Configuring TypeScript

If you're getting errors from TypeScript related to imports with an `*.mdx` extension, create an `mdx.d.ts` file in your types directory and include inside your `tsconfig.json`

```
// types/mdx.d.ts
declare module '*.mdx' {
  let MDXComponent: (props) => JSX.Element;
  export default MDXComponent;
}
```

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
// posts/post.mdx
import { fred, sue } from '../data/authors'
import Layout from '../components/blog-layout'

export const meta = {
  authors: [fred, sue],
  layout: Layout
}

# Post about MDX

MDX is a JSX in Markdown loader, parser, and renderer for ambitious projects.
```

```jsx
// index.js
import React from 'react'
import Mdx, { meta } from 'posts/post.mdx'

const { authors, layout } = meta

export default () => (
  <layout>
    <Mdx />
    By: {authors.map(author => author.name)}
  </layout>
)
```

#### `export default`

The ES default export is used to provide a layout component which will wrap the transpiled JSX.

You can export it as a function:

```jsx
import Layout from './Layout'

export default ({children}) => <Layout some='metadata' >{children}</Layout>

# Hello, world!
```

Or directly as a component:

```jsx
import Layout from './Layout'

export default Layout

# Hello, world!
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

### MDXProvider

If you're using an app layout that wraps your JSX, you can use the `MDXProvider` to only pass your components in one place:

```jsx
import React from 'react'
import { MDXProvider } from '@mdx-js/tag'

import * as components from './markdown-components'

export default props =>
  <MDXProvider components={components}>
    <main {...props} />
  </MDXProvider>
```

## Plugins

Since MDX uses the [remark](https://github.com/remarkjs/remark)/[rehype](https://github.com/rehypejs/rehype) ecosystems, you can use plugins to modify the AST at different stages of the transpilation process.

If you look at the [next example](https://github.com/mdx-js/mdx/blob/master/examples/next/next.config.js#L3), it shows you to pass plugins as options to the [MDX loader](https://github.com/mdx-js/mdx/tree/master/packages/loader).

### Options

Name | Type | Required | Description
---- | ---- | -------- | -----------
`mdPlugins` | Array[] | `false` | Array of remark plugins to manipulate the MDXAST
`hastPlugins` | Array[] | `false` | Array of rehype plugins to manipulate the MDXHAST

#### Specifying plugins

Plugins need to be passed to the MDX loader via webpack options.

```js
const images = require('remark-images')
const emoji = require('remark-emoji')

module.exports = {
  module: {
    rules: [
      {
        test: /\.mdx?$/,
        use: [
          {
            loader: 'babel-loader'
          },
          {
            loader: '@mdx-js/loader',
            options: {
              mdPlugins: [images, emoji]
            }
          }
        ]
      }
    ]
  }
}
```

##### Next.js

If you're using Next.js, you can specify options in your `next.config.js`.

```js
const images = require('remark-images')
const emoji = require('remark-emoji')

module.exports = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx'],
  webpack: (config, { defaultLoaders }) => {
    config.module.rules.push({
      test: /\.md$/,
      use: [
        defaultLoaders.babel,
        {
          loader: '@mdx-js/loader',
          options: {
            mdPlugins: [images, emoji]
          }
        }
      ]
    })

    return config
  }
}
```

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
