# Syntax

## Markdown

## JSX

## Imports

Similarly to JSX, components can be rendered after an `import`:

```jsx
import Graph from './components/graph'

## Here's a graph

<Graph />
```

### Markdown file transclusion

You can transclude Markdown files by importing one `.md` file into another:

```jsx
import License from './license.md'
import Contributing from './docs/contributing.md'

# Hello, world!

<License />

---

<Contributing />
```

## Exports

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

### `export default`

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
