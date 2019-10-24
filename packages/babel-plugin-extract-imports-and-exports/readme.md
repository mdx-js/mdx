# `babel-plugin-extract-imports-and-exports`

Babel plugin that extracts all exports and imports from.
Used by [MDX](https://mdxjs.com).

## Installation

```sh
yarn add babel-plugin-extract-imports-and-exports
```

## Usage

```js
const babel = require('@babel/core')

const BabelPluginHtmlAttributesToJsx = require('babel-plugin-extract-imports-and-exports')

const jsx = `
  import Foo from './foo'
  export const bar = "bar"
  export default props => <article {...props} />
`

const plugin = new BabelPluginHtmlAttributesToJsx()

const result = babel.transform(jsx, {
  configFile: false,
  plugins: [
    '@babel/plugin-syntax-jsx',
    plugin
  ]
})

console.log(result.code)
```

### Input

```js
  import Foo from './foo'
  export const bar = "bar"
  export default props => <article {...props} />
```

### Output

```js
[
  { type: 'import', start: 3 },
  { type: 'export', start: 29 },
  { type: 'export', start: 56, default: true }
]
```

## License

MIT
