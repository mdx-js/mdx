# Plugins

Since MDX uses the [remark][]/[rehype][] ecosystems, you can use plugins to modify the AST at different stages of the transpilation process.

## Transpilation

The MDX transpilation flow consists of six steps, ultimately resulting in JSX that can be used in React/Preact/etc.

1. __Parse__: Text => MDAST
1. __Transpile__: MDAST => MDXAST
1. __Transform__: MDX/Remark plugins applied to AST
1. __Transpile__: MDXAST => MDXHAST
1. __Transform__: Hyperscript plugins applied to AST
1. __Transpile__: MDXHAST => JSX

### Options

Name | Type | Required | Description
---- | ---- | -------- | -----------
`mdPlugins` | Array[] | `false` | Array of remark plugins to manipulate the MDAST
`mdastPlugins` | Array[] | `false` | Array of mdx plugins to manipulate the MDXAST
`hastPlugins` | Array[] | `false` | Array of rehype plugins to manipulate the MDXHAST

#### Specifying plugins

Plugins need to be passed to the MDX loader via webpack options.

```js
const images = require('remark-images')
const emoji = require('remark-emoji')

module.exports = {
  module: {
    rules: [
      {
        test: /\.mdx?$/,
        use: [
          {
            loader: 'babel-loader'
          },
          {
            loader: '@mdx-js/loader',
            options: {
              mdPlugins: [images, emoji]
            }
          }
        ]
      }
    ]
  }
}
```


## Installation

## Usage

[remark]: https://github.com/remarkjs/remark
[rehype]: https://github.com/rehypejs/rehype
