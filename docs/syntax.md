# Syntax

MDX syntax can be boiled down to being JSX in Markdown.
It's a superset of Markdown syntax that also supports importing, exporting, and JSX.

### Markdown

Standard [Markdown syntax][md] is supported.
It's recommended to learn about Markdown in their [docs][md].

### JSX

[JSX syntax][jsx] is fully supported, JSX blocks are opened by starting a line with the `<` character.

```jsx
<Box>
  <Heading>Here's a JSX block</Heading>
  <Text>It's pretty neat</Text>
</Box>
```

### Imports

Imports can be used to [import][] components into the scope and later rendered:

```jsx
import Graph from './components/graph'

## Here's a graph

<Graph />
```

You can also import data that you want to display in a JSX block:

```jsx
import { colors } from './theme'
import Palette from './components/palette'

# Colors

<Palette colors={colors} />
```

#### Markdown file transclusion

You can [transclude][] Markdown files by importing one `.md` or `.mdx` file into another:

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

The ES default [export][] is used to provide a layout component which will wrap the transpiled JSX.

You can export it as a function:

```jsx
import Layout from './Layout'

export default ({ children }) => <Layout some='metadata' >{children}</Layout>

# Hello, world!
```

Or directly as a component:

```jsx
import Layout from './Layout'

export default Layout

# Hello, world!
```

[md]: https://daringfireball.net/projects/markdown/syntax
[jsx]: https://reactjs.org/docs/introducing-jsx.html
[import]: https://developer.mozilla.org/en-US/docs/web/javascript/reference/statements/import
[export]: https://developer.mozilla.org/en-US/docs/web/javascript/reference/statements/export
[transclude]: https://en.wikipedia.org/wiki/Transclusion
