# API

MDX, at its core, is a transpilation library.  It receives and MDX string and outputs a JSX string.  You can also pass [plugins](/plugins) which can customize how MDX creates the JSX string.

By default, MDX is asynchronous because plugins can be asynchronous themselves!  This means that plugins can make request data, read from the file system.  Anything!

## Usage

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

### Input

```js
import TomatoBox from 'tomato-box'

export author = "Fred Flintstone"
export default = props => <main {...props} />

# Hello, world!

Here is a paragraph

<TomatoBox />
```

### Output

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

This is pretty powerful because the output is pretty readable.  The only weird part is the string escaping from Markdown content.

```js
<h1>{`Hello, world!`}</h1>
```

But, that’s to ensure that you can write content that isn’t valid JSX syntax and not break the output.

MDX offers a [sync API](/advanced/sync-api) as well.
