# Advanced

MDX, at its core, is a transpilation library.  It receives an MDX string and outputs a JSX string.  You can also pass [plugins](/plugins) which can customize how MDX creates the JSX string.

Most users won’t typically need to interact with the library but instead use a loader or plugin for their framework of choice.  Though that’s not always the case.

## Usage

For advanced use cases you can use the library directly.  By default, MDX is asynchronous because plugins can be asynchronous themselves.  This means that plugins can request data, read from the file system.  Anything!

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

MDX offers a [sync API](/advanced/sync-api) as well.  This is useful for contexts like a live editor or playground that doesn’t have a need for functionality from async plugins.

## Rendering

If you’re not using a loader or have a custom use case, you will likely want to render to HTML.  Here’s the rendering function we use for our MDX integration tests:

```js
const transform = code =>
  babel.transform(code, {
    plugins: [
      '@babel/plugin-transform-react-jsx',
      '@babel/plugin-proposal-object-rest-spread'
    ]
  }).code

const renderWithReact = async mdxCode => {
  const jsx = await mdx(mdxCode, {skipExport: true})
  const code = transform(jsx)
  const scope = {mdx: createElement}

  const fn = new Function(
    'React',
    ...Object.keys(scope),
    `${code}; return React.createElement(MDXContent)`
  )

  const element = fn(React, ...Object.values(scope))
  const components = {
    h1: ({children}) =>
      React.createElement('h1', {style: {color: 'tomato'}}, children)
  }

  const elementWithProvider = React.createElement(
    MDXProvider,
    {components},
    element
  )

  return renderToStaticMarkup(elementWithProvider)
}
```
