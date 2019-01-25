import { Text } from 'rebass'

# Getting Started

To get started quickly with an example project you can use `npm init`.
It will scaffold out a [Next.js][next] app with MDX configured.

```shell
npm init mdx
```

<Text color="darkgray" mt={-3} mb={4}>
  Note: MDX requires a version of node that is >= v8.5 and React 16.0+
</Text>

## Components

You can pass in components for any HTML element that Markdown compiles to.
This allows you to use your existing components and even CSS-in-JS like
`styled-components`.

The components object is a mapping between the HTML element and your desired
component you’d like to render.

```jsx
const MyH1 = props => <h1 style={{ color: 'tomato' }} {...props} />
const MyParagraph = props => <p style={{ fontSize: '18px', lineHeight: 1.6 }} />

const components = {
  h1: MyH1,
  p: MyParagraph
}
```

#### Example usage

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

With the above, the `Heading` component will be rendered for any `h1`, `Text`
for `p` elements, and so on.

In addition to HTML elements, there’s an `inlineCode`.
This is what remark uses for code elements within paragraphs, tables, etc.

## MDXProvider

If you’re using an app layout that wraps your JSX, you can use the `MDXProvider`
to only pass your components in one place:

```jsx
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

### How it works

MDXProvider uses [React Context][context] to provide the component mapping to
MDXTag.  This way MDXTag knows that it should override the standard components
with those provided in this mapping.

Because MDXProvider uses React Context directly, [it is affected by the same
caveats][context-caveats].  It is therefore important that you do **not**
declare your components mapping inline in the JSX.  Doing so will trigger a
rerender of your entire MDX page with every render cycle.  Not only is this bad
for performance, but it can cause unwanted side affects, like breaking in-page
browser navigation.

Avoid this by following the pattern shown above and declare your mapping as a
constant.

### Table of components

The following components are rendered from Markdown, so these can be keys
in the component object you pass to MDXProvider.

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

### Updating the mapping object during application runtime

If you need to change the mapping during runtime, declare it on the componentʼs
state object:

```jsx
import React from 'react'
import { MDXProvider } from '@mdx-js/tag'

import { Heading, Text, Pre, Code, Table } from './components'

export default class Layout extends React.Component {
  state = {
    h1: Heading.H1,
    h2: Heading.H2,
    // ...
    p: Text,
    code: Pre,
    inlineCode: Code
  }

  render() {
    return (
      <MDXProvider components={this.state}>
        <main {...this.props} />
      </MDXProvider>
    )
  }
}
```

You can now use the `setState` function to update the mapping object and be
assured that it wonʼt trigger unnecessary renders.

## Projects, libraries and frameworks

If you’re already working with a particular tool, you can try out MDX with the
following commands:

*   `npm init mdx` [`webpack`](./webpack)
*   `npm init mdx` [`parcel`](./parcel)
*   `npm init mdx` [`next`](./next)
*   `npm init mdx` [`create-react-app`](./create-react-app)
*   `npm init mdx` [`gatsby`](./gatsby)
*   `npm init mdx` [`x0`](./x0)

[next]: https://github.com/zeit/next.js

[context]: https://reactjs.org/docs/context.html

[context-caveats]: https://reactjs.org/docs/context.html#caveats
