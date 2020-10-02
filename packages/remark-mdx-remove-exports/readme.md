# [remark][]-[mdx][]-remove-exports

[![Build Status][build-badge]][build]
[![lerna][lerna-badge]][lerna]
[![Chat][chat-badge]][chat]

Remove export nodes from the [MDXAST][]. This is useful for scenarios where the exports aren’t needed like an MDX playground.

## Installation

[npm][]:

```shell
npm install --save remark-mdx-remove-exports
```

## Usage

Say we have the following MDX file, `example.mdx`:

```markdown
import { Donut } from 'rebass'

import OtherThing from 'other-place'

export default props => <div {...props} />

# Hello, world!

This is a paragraph
```

And our script, `example.js`, looks as follows:

```javascript
const vfile = require('to-vfile')
const remark = require('remark')
const mdx = require('remark-mdx')
const removeExports = require('remark-mdx-remove-exports')

remark()
  .use(mdx)
  .use(removeExports)
  .process(vfile.readSync('example.md'), function (err, file) {
    if (err) throw err
    console.log(String(file))
  })
```

Now, running `node example` yields:

```markdown
import { Donut } from 'rebass'

import OtherThing from 'other-place'

# Hello, world!

This is a paragraph
```

## Contribute

See the [Support][] and [Contributing][] guidelines on the MDX website for ways
to (get) help.

This project has a [Code of Conduct][coc].
By interacting with this repository, organisation, or community you agree to
abide by its terms.

## License

[MIT][] © [John Otander][johno]

<!-- Definitions -->

[build]: https://travis-ci.com/mdx-js/mdx
[build-badge]: https://travis-ci.com/mdx-js/mdx.svg?branch=master
[lerna]: https://lerna.js.org/
[lerna-badge]: https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg
[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg
[chat]: https://github.com/mdx-js/mdx/discussions
[contributing]: https://mdxjs.com/contributing
[support]: https://mdxjs.com/support
[coc]: https://github.com/mdx-js/.github/blob/master/code-of-conduct.md
[mit]: license
[remark]: https://github.com/remarkjs/remark
[johno]: https://johno.com
[npm]: https://docs.npmjs.com/cli/install
[mdx]: https://mdxjs.com
[mdxast]: https://github.com/mdx-js/specification#mdxast
