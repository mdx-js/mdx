# babel-plugin-extract-export-names

[![Build][build-badge]][build]
[![Downloads][downloads-badge]][downloads]
[![Sponsors][sponsors-badge]][opencollective]
[![Backers][backers-badge]][opencollective]
[![Chat][chat-badge]][chat]

Create a Babel plugin to extract all variable names from export statements.
Used by [MDX][].

## Install

[npm][]:

```sh
npm install babel-plugin-extract-export-names
```

[yarn][]:

```sh
yarn add babel-plugin-extract-export-names
```

## Use

Say we have the following code in `input.js`:

```js
export const foo = 'bar'
export const [A] = [1]
```

And our script, `example.js`:

```js
const fs = require('fs')
const babel = require('@babel/core')
const BabelPluginExtractExportNames = require('babel-plugin-extract-export-names')

const extractExportNames = new BabelPluginExtractExportNames()

babel.transformSync(fs.readFileSync('./input.js'), {
  configFile: false,
  plugins: [extractExportNames.plugin]
})

console.log(extractExportNames.state.names)
```

Now, running `node example` yields:

```js
['foo', 'A']
```

## API

### `BabelPluginExtractExportNames()`

Constructor for an instance to capture export names.

Note that this isn’t a Babel plugin but _creates_ one.

###### Returns

Instance with:

*   `plugin` — Plugin for Babel
*   `state` — Object with a `names` field listing all exported names

## License

MIT

[build-badge]: https://github.com/mdx-js/mdx/workflows/CI/badge.svg
[build]: https://github.com/mdx-js/mdx/actions
[downloads-badge]: https://img.shields.io/npm/dm/babel-plugin-extract-export-names.svg
[downloads]: https://www.npmjs.com/package/babel-plugin-extract-export-names
[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg
[backers-badge]: https://opencollective.com/unified/backers/badge.svg
[opencollective]: https://opencollective.com/unified
[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg
[chat]: https://github.com/mdx-js/mdx/discussions
[mdx]: https://mdxjs.com
[npm]: https://docs.npmjs.com/cli/install
[yarn]: https://yarnpkg.com/cli/add
