# babel-plugin-apply-mdx-type-prop

[![Build][build-badge]][build]
[![Downloads][downloads-badge]][downloads]
[![Sponsors][sponsors-badge]][opencollective]
[![Backers][backers-badge]][opencollective]
[![Chat][chat-badge]][chat]

Create a Babel plugin to both add `mdxType` props to components and extract all
those found named.
Used by [MDX][].

## Install

[npm][]:

```sh
npm install babel-plugin-apply-mdx-type-prop
```

[yarn][]:

```sh
yarn add babel-plugin-apply-mdx-type-prop
```

## Use

Say we have the following code in `input.jsx`:

```jsx
export const Foo = () => (
  <div>
    <Button />
  </div>
)

export default () => (
  <>
    <h1>Hello!</h1>
    <TomatoBox />
  </>
)
```

And our script, `example.js`:

```js
const fs = require('fs')
const babel = require('@babel/core')
const BabelPluginApplyMdxTypeProp = require('babel-plugin-apply-mdx-type-prop')

// Construct one for every file you’re processing.
const applyMdxTypeProp = new BabelPluginApplyMdxTypeProp()

const result = babel.transformSync(fs.readFileSync('./input.jsx'), {
  configFile: false,
  plugins: ['@babel/plugin-syntax-jsx', applyMdxTypeProp.plugin]
})

console.log(result.code)
console.log(applyMdxTypeProp.state.names)
```

Now, running `node example` yields:

```jsx
export const Foo = () => (
  <div>
    <Button mdxType="Button" />
  </div>
)

export default () => (
  <>
    <h1>Hello!</h1>
    <TomatoBox mdxType="TomatoBox" />
  </>
)
```

```js
['Button', 'TomatoBox']
```

## API

### `BabelPluginApplyMdxTypeProp()`

Constructor for an instance to transform and capture MDX types.

Note that this isn’t a Babel plugin but _creates_ one.

###### Returns

Instance with:

*   `plugin` — Plugin for Babel
*   `state` — Object with a `names` field listing all (including duplicates)
    found types

## License

MIT

[build-badge]: https://github.com/mdx-js/mdx/workflows/CI/badge.svg
[build]: https://github.com/mdx-js/mdx/actions
[downloads-badge]: https://img.shields.io/npm/dm/babel-plugin-apply-mdx-type-prop.svg
[downloads]: https://www.npmjs.com/package/babel-plugin-apply-mdx-type-prop
[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg
[backers-badge]: https://opencollective.com/unified/backers/badge.svg
[opencollective]: https://opencollective.com/unified
[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg
[chat]: https://github.com/mdx-js/mdx/discussions
[mdx]: https://mdxjs.com
[npm]: https://docs.npmjs.com/cli/install
[yarn]: https://yarnpkg.com/cli/add
