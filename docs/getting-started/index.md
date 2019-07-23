import { Box } from '@rebass/emotion'

# Getting Started

If you have an existing project you want to integrate MDX with, check out
the installation guides.

<Box
  p={3}
  bg='lightgray'
  style={{
    textAlign: 'center',
    fontWeight: 'bold',
  }}
>

[Next.js](/getting-started/next) \|
[Gatsby](/getting-started/gatsby) \|
[Create React App](/getting-started/create-react-app) \|
[React Static](/getting-started/react-static) \|
[Webpack](/getting-started/webpack) \|
[Parcel](/getting-started/parcel) \|
[Zero](/getting-started/zero)

</Box>

## Table of contents

*   [Hello World](#hello-world)
*   [Syntax](#syntax)
    *   [Markdown](#markdown)
    *   [JSX](#jsx)
    *   [MDX](#mdx)
*   [Working with components](#working-with-components)
    *   [MDXProvider](#mdxprovider)
    *   [Table of components](#table-of-components)
*   [Installation guides](#installation-guides)
    *   [Scaffold out an app](#scaffold-out-an-app)
    *   [Do it yourself](#do-it-yourself)

## Hello World

The smallest MDX example looks like this:

```markdown
# Hello, world!
```

It displays a heading saying “Hello, world!” on the page.
You could also write it like so:

```jsx
<h1>Hello, world!</h1>
```

This displays the same heading.

## Syntax

MDX syntax can be boiled down to being JSX in Markdown.
It’s a superset of Markdown syntax that also supports importing, exporting, and
JSX.

### Markdown

Traditionally, Markdown is used to generate HTML.
Many developers like writing markup in Markdown as it often looks more like
what’s intended and it is typically terser.
Instead of the following HTML:

```html
<blockquote>
<p>A blockquote with <em>some</em> emphasis.</p>
</blockquote>
```

You can write the equivalent in Markdown (or MDX) like so:

```markdown
> A blockquote with *some* emphasis.
```

Markdown is good for **content**.
MDX supports standard [Markdown syntax][md].
It’s important to understand Markdown in order to learn MDX.

### JSX

Recently, more and more developers have started using [JSX][] to generate HTML
markup.
JSX is typically combined with a frontend framework like React or Vue.
These frameworks add support for components, which let you change repeating
things like the following markup:

```html
<h2>Hello, Venus!</h2>
<h2>Hello, Mars!</h2>
```

…to JSX (or MDX) like this:

```jsx
<Welcome name="Venus" />
<Welcome name="Mars" />
```

JSX is good for **components**.
It makes repeating things more clear and allows for separation of concerns.
MDX fully supports [JSX syntax][jsx].
Any line that start with the `<` characters starts a JSX block.

### MDX

We love HTML, but we’ve created MDX to let you combine the benefits of Markdown
with the benefits of JSX.
The following example shows how they can be combined.
It’s interactive so go ahead and change the code!

```.mdx
# Below is a JSX block

<div style={{ padding: '10px 30px', backgroundColor: 'tomato' }}>
  <h2>Try making this heading have the color green</h2>
</div>
```

MDX supports two more features: [imports][] and [exports][].

#### Imports

[`import` (ES2015)][import] can be used to import components, data, and
documents.

##### Components

You can import components, such as your own or from [rebass][], like so:

```jsx
import { Box, Heading, Text } from 'rebass'

# Here is a JSX block

It is using imported components!

<Box>
  <Heading>Here's a JSX block</Heading>
  <Text>It's pretty neat</Text>
</Box>
```

##### Data

You can also import data that you want to display:

```jsx
import snowfallData from './snowfall.json'
import BarChart from './charts/BarChart'

# Recent snowfall trends

2019 has been a particularly snowy year when compared to the last decade.

<BarChart data={snowfallData} />
```

##### Documents

You can embed MDX documents in other documents.
This is also known as [transclusion][transclude].
You can achieve this by importing an `.mdx` (or `.md`) file:

```jsx
import License from './license.md'
import Contributing from './docs/contributing.mdx'

# Hello, world!

<License />

---

<Contributing />
```

#### Exports

[`export` (ES2015)][export] can be used to export data and components.
For example, you can export metadata like which layout to use or the authors of
a document.
It’s a mechanism for an imported MDX file to communicate with the thing that imports it.

Say we import our MDX file, using webpack and React, like so:

```jsx
// index.js
import React from 'react'
import MDXDocument, { metadata } from 'posts/post.mdx'

export default () => (
  <>
    <MDXDocument />
    <footer>
      <p>By: {metadata.authors.map(author => author.name).join(', ') + '.'}</p>
    </footer>
  </>
)
```

And our MDX file looks as follows (note the `export`):

```js
// posts/post.mdx
import { sue, fred } from '../data/authors'

export const metadata = {
  authors: [sue, fred]
}

# Post about MDX

MDX is a JSX in Markdown loader, parser, and renderer for ambitious projects.
```

After bundling and evaluating, we could get something like this:

```html
<h1>Post about MDX</h1>
<p>MDX is a JSX in Markdown loader, parser, and renderer for ambitious projects.</p>
<footer><p>By: Sue, Fred.</p></footer>
```

This is similar to what frontmatter allows in Markdown, but instead of
supporting only data in something like YAML, MDX lets you use richer JavaScript
structures.

##### Defining variables with exports

If you need to define a variable in your MDX document, you can use an export
to do so.  Not only do exports emit data, they instantiate data you can reference
in JSX blocks:

```js
export const myVariable = 'Yay!'

# Hello, world!

<div>{myVariable}</div>
```

## Working with components

In addition to rendering components inline, you can also pass in components
to be used instead of the default HTML elements that Markdown compiles to.
This allows you to use your existing components and even CSS-in-JS like
`styled-components`.

The `components` object is a mapping between the HTML name and the desired
component you’d like to render.

```jsx
// src/App.js
import React from 'react'
import Hello from '../hello.mdx'

const MyH1 = props => <h1 style={{ color: 'tomato' }} {...props} />
const MyParagraph = props => <p style={{ fontSize: '18px', lineHeight: 1.6 }} />

const components = {
  h1: MyH1,
  p: MyParagraph
}

export default () => <Hello components={components} />
```

You can also import your components from another location like your UI library:

```jsx
import React from 'react'
import Hello from '../hello.mdx'

import {
  Text,
  Heading,
  Code,
  InlineCode
} from '../my-ui-library'

export default () =>
  <Hello
    components={{
      h1: Heading,
      p: Text,
      code: Code,
      inlineCode: InlineCode
    }}
  />
```

With the above, the `Heading` component will be rendered for any `h1`, `Text`
for `p` elements, and so on.

In addition to HTML elements, there is one special mapping: `inlineCode` can be
used for code inside paragraphs, tables, etc.

See the [Table of components][components] for supported names.

### MDXProvider

If you’re using an app layout that wraps your application, you can use
the `MDXProvider` to only pass your components in one place:

```jsx
// src/App.js
import React from 'react'
import { MDXProvider } from '@mdx-js/react'

import { Heading, Text, Pre, Code, Table } from './components'

const components = {
  h1: Heading.H1,
  h2: Heading.H2,
  // …
  p: Text,
  code: Pre,
  inlineCode: Code
}

export default props =>
  <MDXProvider components={components}>
    <main {...props} />
  </MDXProvider>
```

This allows you to remove duplicated component passing and importing.
It will typically go in layout files.

#### Using the wrapper

The MDXProvider has a special `wrapper` key that you can use in the component
mapping.
With your wrapper component you can set the layout of your document, inject
styling, or even manipulate the children passed to the component.

```js
// src/App.js
import React from 'react'
import { MDXProvider } from '@mdx-js/react'

const Wrapper = props => <main style={{ padding: '20px', backgroundColor: 'tomato' }} {...props} />

export default ({ children }) =>
  <MDXProvider components={{ wrapper: Wrapper }}>
    {children}
  </MDXProvider>
```

If you would like to see more advanced usage, see the
[wrapper customization guide](/guides/wrapper-customization).

#### Default exports

Sometimes from an MDX file you might want to override the wrapper.
This is especially useful when you want to override layout for a single entry
point at the page level.
To achieve this you can use the ES default [export][] and it will wrap your MDX
document *instead* of the wrapper passed to MDXProvider.

You can declare a default export as a function:

```jsx
import Layout from './Layout'

export default ({ children }) => <Layout some='metadata' >{children}</Layout>

# Hello, world!
```

Or directly as a component:

```jsx
import Layout from './Layout'

export default Layout

# Hello, world!
```

Either works.
Whatever you prefer!

### Table of components

`MDXProvider` uses [React Context][context] to provide the component mapping
internally to MDX when it renders.
The following components are rendered from Markdown, so these can be keys in the
component object you pass to `MDXProvider`.

| Tag             | Name                                                                 | Syntax                                              |
| --------------- | -------------------------------------------------------------------- | --------------------------------------------------- |
| `p`             | [Paragraph](https://github.com/syntax-tree/mdast#paragraph)          |                                                     |
| `h1`            | [Heading 1](https://github.com/syntax-tree/mdast#heading)            | `#`                                                 |
| `h2`            | [Heading 2](https://github.com/syntax-tree/mdast#heading)            | `##`                                                |
| `h3`            | [Heading 3](https://github.com/syntax-tree/mdast#heading)            | `###`                                               |
| `h4`            | [Heading 4](https://github.com/syntax-tree/mdast#heading)            | `####`                                              |
| `h5`            | [Heading 5](https://github.com/syntax-tree/mdast#heading)            | `#####`                                             |
| `h6`            | [Heading 6](https://github.com/syntax-tree/mdast#heading)            | `######`                                            |
| `thematicBreak` | [Thematic break](https://github.com/syntax-tree/mdast#thematicbreak) | `***`                                               |
| `blockquote`    | [Blockquote](https://github.com/syntax-tree/mdast#blockquote)        | `>`                                                 |
| `ul`            | [List](https://github.com/syntax-tree/mdast#list)                    | `-`                                                 |
| `ol`            | [Ordered list](https://github.com/syntax-tree/mdast#list)            | `1.`                                                |
| `li`            | [List item](https://github.com/syntax-tree/mdast#listitem)           |                                                     |
| `table`         | [Table](https://github.com/syntax-tree/mdast#table)                  |                                                     |
| `tr`            | [Table row](https://github.com/syntax-tree/mdast#tablerow)           |                                                     |
| `td`/`th`       | [Table cell](https://github.com/syntax-tree/mdast#tablecell)         |                                                     |
| `pre`           | [Pre](https://github.com/syntax-tree/mdast#code)                     |                                                     |
| `code`          | [Code](https://github.com/syntax-tree/mdast#code)                    | \``\`code\`\`\`                                     |
| `em`            | [Emphasis](https://github.com/syntax-tree/mdast#emphasis)            | `_emphasis_`                                        |
| `strong`        | [Strong](https://github.com/syntax-tree/mdast#strong)                | `**strong**`                                        |
| `delete`        | [Delete](https://github.com/syntax-tree/mdast#delete)                | `~~strikethrough~~`                                 |
| `inlineCode`    | [InlineCode](https://github.com/syntax-tree/mdast#inlinecode)        | `` `inlineCode` ``                                  |
| `hr`            | [Break](https://github.com/syntax-tree/mdast#break)                  | `---`                                               |
| `a`             | [Link](https://github.com/syntax-tree/mdast#link)                    | `<https://mdxjs.com>` or `[MDX](https://mdxjs.com)` |
| `img`           | [Image](https://github.com/syntax-tree/mdast#image)                  | `![alt](https://mdx-logo.now.sh)`                   |

## Installation guides

Now that we’ve gone over how MDX works, you’re ready to get installing.

### Scaffold out an app

If you’re the type of person that wants to scaffold out an app quickly and start
playing around you can use `npm init`:

*   `npm init mdx` [`webpack`](/getting-started/webpack)
*   `npm init mdx` [`parcel`](/getting-started/parcel)
*   `npm init mdx` [`next`](/getting-started/next)
*   `npm init mdx` [`create-react-app`](/getting-started/create-react-app)
*   `npm init mdx` [`gatsby`](/getting-started/gatsby)
*   `npm init mdx` [`x0`](/getting-started/x0)
*   `npm init mdx` [`react-static`](/getting-started/react-static)

### Do it yourself

If your favorite bundler or framework isn’t listed above, or if you have a
custom use case, you can of course do it yourself.
The below rendering function is what we use for our MDX integration tests:

```js
const babel = require('@babel/core')
const React = require('react')
const {renderToStaticMarkup} = require('react-dom/server')

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

[imports]: #imports

[exports]: #exports

[components]: #table-of-components

[md]: https://daringfireball.net/projects/markdown/syntax

[jsx]: https://reactjs.org/docs/introducing-jsx.html

[import]: https://developer.mozilla.org/en-US/docs/web/javascript/reference/statements/import

[export]: https://developer.mozilla.org/en-US/docs/web/javascript/reference/statements/export

[rebass]: https://rebassjs.org

[transclude]: https://en.wikipedia.org/wiki/Transclusion

[context]: https://reactjs.org/docs/context.html
