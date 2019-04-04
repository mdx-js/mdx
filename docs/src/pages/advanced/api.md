# API

MDX (the library), at its core, transforms MDX (the syntax) to JSX.
It receives an MDX string and outputs a JSX string.
It does this by parsing the MDX document to a [syntax tree][ast] and then
generates a JSX document from that tree.
The JSX document is typically evaluated later through something like Babel or
webpack.
You can extend MDX by passing [plugins][] that change the tree to customize how
the JSX string is created.

## Table of Contents

*   [Async API](#async-api)
*   [Sync API](#sync-api)

## Async API

By default, MDX is [asynchronous][async] because plugins can be asynchronous
themselves!
This means that plugins can request data, read from the file system.
Anything!
You should use the async API, unless you have very good reasons to use the
[sync API][sync].

You can use the library directly:

```js
var mdx = require("@mdx-js/mdx")

const content = `
# Hello, world!
`

const transpile = async () => {
  const jsx = await mdx(content)
  return jsx
}

transpile().then(console.log)
```

With more complex input, we can see more interesting output:

###### Input

```js
import TomatoBox from 'tomato-box'

export author = "Fred Flintstone"
export default = props => <main {...props} />

# Hello, world!

Here is a paragraph

<TomatoBox />
```

###### Output

```js
import TomatoBox from 'tomato-box'

const MDXLayout = props => <main {...props} />

const layoutProps = {
  author: "Fred Flintstone"
}

export default function MDXContent(props) {
  return (
    <div name="wrapper" components={components}>
      <MDXLayout {...layoutProps} {...props}>
        <h1>{`Hello, world!`}</h1>
        <p>{`Here is a paragraph`}</p>
        <TomatoBox />
      </MDXLayout>
    </div>
  );
}

MDXContent.isMDXComponent = true;
```

This is pretty powerful because the output is rather readable.
The only weird part is the string escaping from Markdown content:

```js
<h1>{`Hello, world!`}</h1>
```

It’s not super readable, but it makes sure you can write content that wouldn’t
be valid JSX syntax!

## Sync API

MDX processes everything [asynchronously][async] by default.
In certain cases this behavior might not be desirable.

If you’re using the MDX library directly, you might want to process an MDX
string synchronously.
It’s important to note that if you have any async plugins, they will be ignored.

```js
const fs = require('fs')
const mdx = require('@mdx-js/mdx')

const mdxText = fs.readFileSync('hello.mdx', 'utf8')

const jsx = mdx.sync(mdxText)
```

<!-- TODO: links should be updated. Can we also inline this example? -->

MDX’s [runtime][] package has [example][] usage.

[ast]: /advanced/ast

[plugins]: /plugins

[async]: #async-api

[sync]: #sync-api

[runtime]: /advanced/runtime

[example]: https://github.com/mdx-js/mdx/blob/d5a5189e715dc28370de13f6cc0fd18a06f0f122/packages/runtime/src/index.js#L16-L18
