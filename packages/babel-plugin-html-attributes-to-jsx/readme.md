# `babel-plugin-html-attributes-to-jsx`

Coerce HTML attributes into something JSX and React
friendly. Used by [MDX](https://mdxjs.com).

## Installation

```sh
yarn add babel-plugin-html-attributes-to-jsx
```

## Usage

```js
const babel = require('@babel/core')

const plugin = require('babel-plugin-html-attributes-to-jsx')

const jsx = `
export const Foo = () => (
  <div srcset="foo">
    <Button />
  </div>
)
`

const plugin = new BabelPluginHtmlAttributesToJsx()

const result = babel.transform(jsx, {
  configFile: false,
  plugins: ['@babel/plugin-syntax-jsx', plugin]
})

console.log(result.code)
```

### Input

```js
export const Foo = () => (
  <div srcset="foo">
    <Button />
  </div>
)
```

### Output

```js
const Foo = () => (
  <div srcSet="foo">
    <Button />
  </div>
)
```

## License

MIT
