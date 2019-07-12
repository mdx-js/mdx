import Note from 'gatsby-theme-mdx/src/components/note'
import BabelConfig from './babel-config.md'

# Webpack

<Note>
  TODO: Add plugin documentation
</Note>

MDX provides a built in webpack loader you need to install and configure
for webpack projects.

## Installation

```sh
npm install --save-dev @mdx-js/loader
```

## Configuration

The loader needs to be used in tandem with the [babel-loader][].  Most projects will typically
already include this if you are using JSX syntax.

For webpack projects you can define the following `webpack.config.js` extension
handler for `.md` and `.mdx` files:

```js
module.exports = {
  module: {
    // ...

    rules: [
      // ...

      {
        test: /\.mdx?$/,
        use: [
          'babel-loader',
          '@mdx-js/loader'
        ]
      }
    ]
  }
}
```

If you only want the loader for `.mdx` files you can change the regex to `/\.mdx$/`.

The transpiled output for MDX requires [babel][] to be run.  This is typically
by adding in the babel-loader to run *after* the MDX loader.  Webpack starts
from the end of the loaders array and works backward, so it is important to
follow the ordering above.

## Running MDX in the browser

If you’re running MDX in the browser you will need to configure webpack to ignore
the `fs` module:

```js
module.exports = {
  node: {
    fs: 'empty'
  }
}
```

[See the webpack docs](https://webpack.js.org/configuration/node/#other-node-core-libraries)

<BabelConfig />

[babel-loader]: https://webpack.js.org/loaders/babel-loader/

[babel]: https://babeljs.io
