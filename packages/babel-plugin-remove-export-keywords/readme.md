# babel-plugin-remove-export-keywords

[![Build][build-badge]][build]
[![Downloads][downloads-badge]][downloads]
[![Sponsors][sponsors-badge]][opencollective]
[![Backers][backers-badge]][opencollective]
[![Chat][chat-badge]][chat]

Babel plugin to remove all export statements.
Used by [MDX][].

## Install

[npm][]:

```sh
npm install babel-plugin-remove-export-keywords
```

[yarn][]:

```sh
yarn add babel-plugin-remove-export-keywords
```

## Use

Say we have the following code in `input.jsx`:

```js
export const Foo = () => (
  <div>
    <Button />
  </div>
)
```

And our script, `example.js`:

```js
const fs = require('fs')
const babel = require('@babel/core')
const removeExportKeywords = require('babel-plugin-remove-export-keywords')

const result = babel.transformSync(fs.readFileSync('./input.jsx'), {
  configFile: false,
  plugins: ['@babel/plugin-syntax-jsx', removeExportKeywords]
})

console.log(result.code)
```

Now, running `node example` yields:

```jsx
const Foo = () => (
  <div>
    <Button />
  </div>
)
```

## API

### `removeExportKeywords`

Plugin for Babel to remove `export` keywords.

## License

MIT

[build-badge]: https://github.com/mdx-js/mdx/workflows/CI/badge.svg
[build]: https://github.com/mdx-js/mdx/actions
[downloads-badge]: https://img.shields.io/npm/dm/babel-plugin-remove-export-keywords.svg
[downloads]: https://www.npmjs.com/package/babel-plugin-remove-export-keywords
[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg
[backers-badge]: https://opencollective.com/unified/backers/badge.svg
[opencollective]: https://opencollective.com/unified
[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg
[chat]: https://github.com/mdx-js/mdx/discussions
[mdx]: https://mdxjs.com
[npm]: https://docs.npmjs.com/cli/install
[yarn]: https://yarnpkg.com/cli/add
