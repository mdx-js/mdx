# Components

The MDX core library accepts a string and exports a JSX string.

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
