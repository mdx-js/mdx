import { Message } from 'rebass'

# Webpack

<Message>
  This docs page is a WIP
</Message>

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
