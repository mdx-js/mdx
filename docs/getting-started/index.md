import { Flex, Card, Link, Text } from 'rebass'

export const InstallationGuides = () => (
  <Flex flexWrap="wrap">
    <Card mb={3} mr={3} px={4} py={3} width={1/2.1}>
      <Text fontWeight="bold" textAlign="center">
        <Link color="black" href="/getting-started/next">Next.js</Link>
      </Text>
    </Card>
    <Card mb={3} px={4} py={3} width={1/2.1}>
      <Text fontWeight="bold" textAlign="center">
        <Link color="black" href="/getting-started/gatsby">Gatsby</Link>
      </Text>
    </Card>
    <Card mb={3} mr={3} px={4} py={3} width={1/2.1}>
      <Text fontWeight="bold" textAlign="center">
        <Link color="black" href="/getting-started/create-react-app">Create React App</Link>
      </Text>
    </Card>
    <Card mb={3} px={4} py={3} width={1/2.1}>
      <Text fontWeight="bold" textAlign="center">
        <Link color="black" href="/getting-started/react-static">React Static</Link>
      </Text>
    </Card>
    <Card mb={3} mr={3} px={4} py={3} width={1/2.1}>
      <Text fontWeight="bold" textAlign="center">
        <Link color="black" href="/getting-started/wepack">Webpack</Link>
      </Text>
    </Card>
    <Card mb={3} px={4} py={3} width={1/2.1}>
      <Text fontWeight="bold" textAlign="center">
        <Link color="black" href="/getting-started/parcel">Parcel</Link>
      </Text>
    </Card>
  </Flex>
)

# Getting Started

If you have an existing project you want to integrate MDX with, check out
the installation guides.

<InstallationGuides />

## Table of contents

*   [Scaffold out an app](#scaffold-out-an-app)
*   [Syntax](#syntax)
    *   [Markdown](#markdown)
    *   [JSX](#jsx)
    *   [Exports](#exports)
*   [Working with components](#working-with-components)
    *   [MDXProvider](#mdxprovider)
    *   [Table of components](#table-of-components)
*   [Installation guides](#installation-guides)

## Scaffold out an app

If you’re the type of person that wants to scaffold out an app quickly and start
playing around you can use `npm init`:

*   `npm init mdx` [`webpack`](./webpack)
*   `npm init mdx` [`parcel`](./parcel)
*   `npm init mdx` [`next`](./next)
*   `npm init mdx` [`create-react-app`](./create-react-app)
*   `npm init mdx` [`gatsby`](./gatsby)
*   `npm init mdx` [`x0`](./x0)
*   `npm init mdx` [`react-static`](./react-static)

## Syntax

MDX syntax can be boiled down to being JSX in Markdown.
It’s a superset of Markdown syntax that also supports importing, exporting, and
JSX.

### Markdown

Standard [Markdown syntax][md] is supported.
It’s recommended to learn about Markdown in their [docs][md].

### JSX

[JSX syntax][jsx] is fully supported, JSX blocks are opened by starting a line
with the `<` character.

```.mdx
# Below is a JSX block

<div style={{ padding: '10px 30px', backgroundColor: 'tomato' }}>
  <h2>Try editing the code below</h2>
</div>
```

#### Imports

Imports can be used to [import][] components into the scope and later rendered:

```jsx
import { Box, Heading, Text } from 'rebass'

# Here is a JSX block

It is using imported components!

<Box>
  <Heading>Here's a JSX block</Heading>
  <Text>It's pretty neat</Text>
</Box>
```

You can also import data that you want to display in a JSX block:

```jsx
import { colors } from './theme'
import Palette from './components/palette'

# Colors

<Palette colors={colors} />
```

##### Embedding documents

You can embed MDX documents in other documents.  This is also known as
[transclusion][transclude].  You can achieve this by importing one `.md`
or `.mdx` file into another:

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
It’s a mechanism for an imported MDX file to communicate with its parent.
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

The ES default [export][] is used to provide a layout component which will wrap
the transpiled JSX.

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

## Working with components

In additon to rendering components inline, you can also pass in components
for any HTML element that Markdown compiles to.  This allows you to use your
existing components and even CSS-in-JS like `styled-components`.

The components object is a mapping between the HTML element and your desired
component you’d like to render.

```jsx
// src/App.js
import React from 'react'
import Hello from '../hello.mdx'

const MyH1 = props => <h1 style={{ color: 'tomato' }} {...props} />
const MyParagraph = props => <p style={{ fontSize: '18px', lineHeight: 1.6 }} />

const components = {
  h1: MyH1,
  p: MyParagraph
}

export default () => <Hello components={components} />
```

You can also import your components from another location like your UI library:

```jsx
import React from 'react'
import Hello from '../hello.mdx'

import {
  Text,
  Heading,
  Code,
  InlineCode
} from '../ui-library'

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

With the above, the `Heading` component will be rendered for any `h1`, `Text`
for `p` elements, and so on.

In addition to HTML elements, there’s an `inlineCode`.
This is what remark uses for code elements within paragraphs, tables, etc.

### MDXProvider

If you’re using an app layout that wraps your application, you can use
the `MDXProvider` to only pass your components in one place:

```jsx
// src/App.js
import React from 'react'
import { MDXProvider } from '@mdx-js/tag'

import { Heading, Text, Pre, Code, Table } from './components'

const components = {
  h1: Heading.H1,
  h2: Heading.H2,
  // ...
  p: Text,
  code: Pre,
  inlineCode: Code
}

export default props =>
  <MDXProvider components={components}>
    <main {...props} />
  </MDXProvider>
```

This allows you to remove duplicated component imports and passing.
It will typically go in layout files.

### Table of components

MDXProvider uses [React Context][context] to provide the component mapping
internally to MDX when it renders.  The following components are rendered from
Markdown, so these can be keys in the component object you pass to MDXProvider.

| Tag             | Name                                                                 | Syntax                                              |
| --------------- | -------------------------------------------------------------------- | --------------------------------------------------- |
| `p`             | [Paragraph](https://github.com/syntax-tree/mdast#paragraph)          |                                                     |
| `h1`            | [Heading 1](https://github.com/syntax-tree/mdast#heading)            | `#`                                                 |
| `h2`            | [Heading 2](https://github.com/syntax-tree/mdast#heading)            | `##`                                                |
| `h3`            | [Heading 3](https://github.com/syntax-tree/mdast#heading)            | `###`                                               |
| `h4`            | [Heading 4](https://github.com/syntax-tree/mdast#heading)            | `####`                                              |
| `h5`            | [Heading 5](https://github.com/syntax-tree/mdast#heading)            | `#####`                                             |
| `h6`            | [Heading 6](https://github.com/syntax-tree/mdast#heading)            | `######`                                            |
| `thematicBreak` | [Thematic break](https://github.com/syntax-tree/mdast#thematicbreak) | `***`                                               |
| `blockquote`    | [Blockquote](https://github.com/syntax-tree/mdast#blockquote)        | `>`                                                 |
| `ul`            | [List](https://github.com/syntax-tree/mdast#list)                    | `-`                                                 |
| `ol`            | [Ordered list](https://github.com/syntax-tree/mdast#list)            | `1.`                                                |
| `li`            | [List item](https://github.com/syntax-tree/mdast#listitem)           |                                                     |
| `table`         | [Table](https://github.com/syntax-tree/mdast#table)                  | `--- | --- | ---`                                   |
| `tr`            | [Table row](https://github.com/syntax-tree/mdast#tablerow)           | `This | is | a | table row`                         |
| `td`/`th`       | [Table cell](https://github.com/syntax-tree/mdast#tablecell)         |                                                     |
| `pre`           | [Pre](https://github.com/syntax-tree/mdast#code)                     |                                                     |
| `code`          | [Code](https://github.com/syntax-tree/mdast#code)                    |                                                     |
| `em`            | [Emphasis](https://github.com/syntax-tree/mdast#emphasis)            | `_emphasis_`                                        |
| `strong`        | [Strong](https://github.com/syntax-tree/mdast#strong)                | `**strong**`                                        |
| `delete`        | [Delete](https://github.com/syntax-tree/mdast#delete)                | `~~strikethrough~~`                                 |
| `code`          | [InlineCode](https://github.com/syntax-tree/mdast#inlinecode)        |                                                     |
| `hr`            | [Break](https://github.com/syntax-tree/mdast#break)                  | `---`                                               |
| `a`             | [Link](https://github.com/syntax-tree/mdast#link)                    | `<https://mdxjs.com>` or `[MDX](https://mdxjs.com)` |
| `img`           | [Image](https://github.com/syntax-tree/mdast#image)                  | `![alt](https://mdx-logo.now.sh)`                   |

## Installation guides

Now that we’ve gone over how MDX works, you’re ready to get installing.

<InstallationGuides />

[md]: https://daringfireball.net/projects/markdown/syntax

[jsx]: https://reactjs.org/docs/introducing-jsx.html

[import]: https://developer.mozilla.org/en-US/docs/web/javascript/reference/statements/import

[export]: https://developer.mozilla.org/en-US/docs/web/javascript/reference/statements/export

[transclude]: https://en.wikipedia.org/wiki/Transclusion

[context]: https://reactjs.org/docs/context.html
