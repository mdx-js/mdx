import { Message } from 'rebass'

# Sync API

MDX processes everything asynchronously by default.
In certain cases this behavior might not be desirable.

If you're using the MDX library directly, you might want to process an MDX string synchronously.
It's important to note that if you have any async plugins, they will be ignored.

```js
const fs = require('fs')
const mdx = require('@mdx-js/mdx')

const mdxText = fs.readFileSync('hello.mdx', 'utf8')

const jsx = mdx.sync(mdxText)
```

MDX's [runtime][] package has [example][] usage.

[runtime]: https://github.com/mdx-js/mdx/tree/master/packages/runtime
[example]: https://github.com/mdx-js/mdx/blob/d5a5189e715dc28370de13f6cc0fd18a06f0f122/packages/runtime/src/index.js#L16-L18
