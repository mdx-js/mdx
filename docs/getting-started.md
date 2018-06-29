# Getting Started

```
npm install --save-dev @mdx-js/mdx
```

> Note: MDX requires a version of node that is >= v8.5

## Basic Setup

MDX provides a loader that needs to be used in tandem with the [babel-loader][babel-loader].

For webpack projects

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

## Usage

If you're using a framework or tool like [Next][next], [Create React App][cra], [x0][x0], or [Gatsby][gatsby] you can get up and running quickly with a few steps.

#### Next

Next.js provides an [official plugin][next-plugin] to simplify MDX importing into your project.

```
npm install --save-dev @zeit/next-mdx
```

To configure MDX, add the following to your `next.config.js`:

```js
const withMDX = require('@zeit/next-mdx')({
  extension: /\.mdx?$/
})

module.exports = withMDX({
  // Add 'md' to this array if you name your MDX files with the '.md' extension
  pageExtensions: ['js', 'jsx', 'mdx']
})
```

#### Create React App

With Create React App you will need to use [`create-react-app-rewired`][cra-rewired] and add a `config-overrides.js`.

```js
const { getBabelLoader } = require('react-app-rewired')
module.exports = (config, env) => {
  const babelLoader = getBabelLoader(config.module.rules)
  config.module.rules.map(rule => {
    if (typeof rule.test !== 'undefined' || typeof rule.oneOf === 'undefined') {
      return rule
    }

    rule.oneOf.unshift({
      test: /\.mdx$/,
      use: [
        {
          loader: babelLoader.loader,
          options: babelLoader.options
        },
        '@mdx-js/loader'
      ]
    })

    return rule
  })
  return config
}
```

[See the full example][cra-example]

#### x0

x0 supports MDX files with either `.md` or `.mdx` file extensions out of the box, but you will need to use the component provider in `_app.js`. Here's an example using [Rebass][rebass] components:

```jsx
import React from 'react'
import * as Rebass from 'rebass'
import createScope from '@rebass/markdown'
import { ScopeProvider } from '@compositor/x0/components'

export default ({ route, routes, ...props }) => (
  <ScopeProvider scope={{ ...Rebass, ...createScope() }}>
    <Rebass.Provider>
      <Rebass.Box p={[2, 4, 4]} {...props} />
    </Rebass.Provider>
  </ScopeProvider>
)
```

#### Gatsby

In order to use with Gatsby you can use the [gatbsy-transformer-mdx][gatsby-transformer].

> More docs for integration with Gatbsy coming soon!

### Other

If the tool or framework you use is missing, check the [examples][mdx-examples] directory or file an issue/PR.

[mdx-examples]: https://github.com/mdx-js/mdx/tree/master/examples
[babel-loader]: https://github.com/babel/babel-loader
[next]: https://github.com/zeit/next.js
[next-mdx]: https://github.com/zeit/next-plugins/tree/master/packages/next-mdx
[cra]: https://github.com/facebook/create-react-app
[cra-rewired]: https://github.com/timarney/react-app-rewired
[cra-example]: https://github.com/mdx-js/mdx/tree/master/examples/create-react-app
[x0]: https://compositor.io/x0
[rebass]: https://jxnblk.com/rebass
[gatsby]: https://gatsbyjs.org
[gatsby-transformer]: https://github.com/avigoldman/avigoldman.com/tree/master/plugins/gatsby-transformer-mdx
