# babel-plugin-extract-import-names

[![Build][build-badge]][build]
[![Downloads][downloads-badge]][downloads]
[![Sponsors][sponsors-badge]][opencollective]
[![Backers][backers-badge]][opencollective]
[![Chat][chat-badge]][chat]

Create a Babel plugin to extract all variable names from import statements.
Used by [MDX][].

## Install

[npm][]:

```sh
npm install babel-plugin-extract-import-names
```

[yarn][]:

```sh
yarn add babel-plugin-extract-import-names
```

## Use

Say we have the following code in `input.js`:

```js
import Foo from 'bar'
import { Bar } from 'baz'
```

And our script, `example.js`:

```js
const fs = require('fs')
const babel = require('@babel/core')
const BabelPluginExtractImportNames = require('babel-plugin-extract-import-names')

const extractImportNames = new BabelPluginExtractImportNames()

babel.transformSync(fs.readFileSync('./input.js'), {
  configFile: false,
  plugins: [extractImportNames.plugin]
})

console.log(extractImportNames.state.names)
```

Now, running `node example` yields:

```js
['Foo', 'Bar']
```

## API

### `BabelPluginExtractImportNames()`

Constructor for an instance to capture import names.

Note that this isn’t a Babel plugin but _creates_ one.

###### Returns

Instance with:

*   `plugin` — Plugin for Babel
*   `state` — Object with a `names` field listing all imported names

## License

MIT

[build-badge]: https://github.com/mdx-js/mdx/workflows/CI/badge.svg
[build]: https://github.com/mdx-js/mdx/actions
[downloads-badge]: https://img.shields.io/npm/dm/babel-plugin-extract-import-names.svg
[downloads]: https://www.npmjs.com/package/babel-plugin-extract-import-names
[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg
[backers-badge]: https://opencollective.com/unified/backers/badge.svg
[opencollective]: https://opencollective.com/unified
[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg
[chat]: https://github.com/mdx-js/mdx/discussions
[mdx]: https://mdxjs.com
[npm]: https://docs.npmjs.com/cli/install
[yarn]: https://yarnpkg.com/cli/add
