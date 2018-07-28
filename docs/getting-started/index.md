import { Text } from 'rebass'

# Getting Started

```
npm init mdx
```

<Text color="darkgray" mt={-3} mb={4}>
  Note: MDX requires a version of node that is >= v8.5 and React 16.0+
</Text>

## Projects, libraries and frameworks

If you're already working with a particular tool, you can try out MDX with the following commands:

- `npm init mdx` [`webpack`](./webpack)
- `npm init mdx` [`parcel`](./parcel)
- `npm init mdx` [`next`](./next)
- `npm init mdx` [`create-react-app`](./create-react-app)
- `npm init mdx` [`gatsby`](./gatsby)
- `npm init mdx` [`x0`](./x0)

## Provider

MDX uses an html element to component mapping for overriding default elements.
You can also use the `<MDXProvider />` to provide the mapping at the app level.

Firstly, if you'd like to ensure that all your `h1` elements are tomato, you'd create a mapping like so:

```jsx
const components = {
  h1: props => <h1 style={{ color: 'tomato' }} {...props} />
}
```

Then, you'd wrap your app with the `<MDXProvider />` and pass the components as a prop:

```jsx
import React from 'react'
import { MDXProvider } from '@mdx-js/tag'

const components = {
  h1: props => <h1 style={{ color: 'tomato' }} {...props} />
}

export default props =>
  <MDXProvider components={components}>
    <main {...props} />
  </MDXProvider>
```
