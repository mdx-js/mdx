# Components

You can pass in components for any HTML element that Markdown compiles to.
This allows you to use your existing components and even CSS-in-JS like `styled-components`.

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

import * as components from './markdown-components'

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

## MDXTag

MDXTag is an internal component that MDX uses to map components to an HTML element based on the Markdown syntax.
Consider the following MDX:

```
import MyComponent from './my-component'

# Title

<MyComponent />

Lorem ipsum dolor sit amet.
```

MDX core turns that text into the following JSX to be consumed by your app:

```jsx
import React from 'react'
import { MDXTag } from '@mdx-js/tag'
import MyComponent from './my-component'

export default ({ components }) => (
  <MDXTag name="wrapper" components={components}>
    <MDXTag name="h1" components={components}>
      Title
    </MDXTag>
    <MyComponent />
    <MDXTag name="p" components={components}>
      Lorem ipsum dolor sit amet.
    </MDXTag>
  </MDXTag>
)
```

If the component mapping contains a `p` key, that will be used for "Lorem ipsum dolor sit amet.", otherwise a standard `p` tag is rendered (`<p>Lorem ipsum dolor sit amet.</p>`).
This is what allows you to pull in existing components to style your MDX documents.

[context]: https://reactjs.org/docs/context.html
