import { Text } from 'rebass'

# Getting Started

To get started quickly with an example project you can use `npm init`.
It will scaffold out a [Next.js][next] app with MDX configured.

```
npm init mdx
```

<Text color="darkgray" mt={-3} mb={4}>
  Note: MDX requires a version of node that is >= v8.5 and React 16.0+
</Text>

## Components

You can pass in components for any HTML element that Markdown compiles to.
This allows you to use your existing components and even CSS-in-JS like `styled-components`.

The components object is a mapping between the HTML element and your desired component you'd like to render.

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

With the above, the Heading component will be rendered for any h1, Text for p tags, and so on.

In addition to HTML elements, there's an `inlineCode`.
This is what remark uses for code elements within paragraphs, tables, etc.

## MDXProvider

If you're using an app layout that wraps your JSX, you can use the `MDXProvider` to only pass your components in one place:

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

#### How does it work?

MDXProvider uses React [context][] to provide the component mapping to MDXTag.
MDXTag knows to use these components when determining which to render.

## Projects, libraries and frameworks

If you're already working with a particular tool, you can try out MDX with the following commands:

- `npm init mdx` [`webpack`](./webpack)
- `npm init mdx` [`parcel`](./parcel)
- `npm init mdx` [`next`](./next)
- `npm init mdx` [`create-react-app`](./create-react-app)
- `npm init mdx` [`gatsby`](./gatsby)
- `npm init mdx` [`x0`](./x0)

[next]: https://github.com/zeit/next.js
[context]: https://reactjs.org/docs/context.html
