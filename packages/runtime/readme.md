# Runtime MDX

Parse and render MDX in a runtime environment

## :warning: Warning

This is not the preferred way to use MDX since it introduces a substantial amount of overhead and dramatically increases bundle sizes.
It should also not be used with user input that isn't sandboxed.

## Installation

```
npm install --save @mdx-js/runtime
```

## Usage

```jsx
import React from 'react'
import MDX from '@mdx-js/runtime'

const components = {
  h1: props => <h1 style={{ color: 'tomato' }} {...props} />
}

const mdx = '# Hello, world!'

export default () => (
  <MDX components={components}>{mdx}</MDX>
)
```

## Related

- [MDX Docs](https://github.com/mdx-js/mdx)
