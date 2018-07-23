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
