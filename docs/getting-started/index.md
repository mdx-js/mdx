import { Text } from 'rebass'

# Getting Started

```
npm install --save-dev @mdx-js/mdx
```

<Text color="darkgray" mt={-3} mb={4}>
  Note: MDX requires a version of node that is >= v8.5 and React 16.0+
</Text>

- [Webpack](./webpack)
- [Parcel](./parcel)
- [Next](./next)
- [Create React App](./create-react-app)
- [Gatsby](./gatsby)
- [x0](./x0)

## Basic Setup

MDX provides a loader that needs to be used in tandem with the [babel-loader][babel-loader].

For webpack projects you can define the following `webpack.config.js`:

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.mdx?$/,
        use: ['babel-loader', '@mdx-js/loader']
      }
    ]
  }
}
```

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

### Other

If the tool or framework you use is missing, check the [examples][] directory or file an issue/PR.

[examples]: https://github.com/mdx-js/mdx/tree/master/examples
[babel-loader]: https://github.com/babel/babel-loader
[next]: https://github.com/zeit/next.js
[next-mdx]: https://github.com/zeit/next-plugins/tree/master/packages/next-mdx
[gatsby]: https://gatsbyjs.org
[gatsby-transformer]: https://github.com/avigoldman/avigoldman.com/tree/master/plugins/gatsby-transformer-mdx
