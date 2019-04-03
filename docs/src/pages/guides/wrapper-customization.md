import Note from '../../components/note'

# Wrapper customization

The [wrapper](/getting-started#using-the-wrapper) component can be used
to set the layout for the MDX document.  It’s often used to set container
width, borders, background colors, etc.  However, it’s also unique because
it has access to the children passed to it.

This means that you can do powerful things with the MDX document elements.
If you aren’t very familiar with React children, it might be worthwile to
start with [_A deep dive into children in React_](https://mxstbr.blog/2017/02/react-children-deepdive/)
by Max Stoiber.

> We can render arbitrary components as children, but still control them from the
> parent instead of the component we render them from.
>
> _Max Stoiber - A deep dive into children in React_

The implications of this are very interesting from the context of an
MDX wrapper component.  This means the wrapper can do things like reordering
components, wrapping them, or even further customizing them.

## Getting started

For the purposes of this guide we will use the following MDX:

```md
### Kicker

# Hello, world!

Working with React children is fun!
```

### Using the wrapper for layout

You can use the `wrapper` element in MDXProvider to set layout and even
background color for your MDX documents.

```js
// src/App.js
import React from 'react'

import {MDXProvider} from '@mdx-js/react'

const components = {
  wrapper: props => (
    <div style={{ padding: '20px', backgroundColor: 'tomato' }}>
      <main {...props} />
    </div>
  )
}

export default props => (
  <MDXProvider components={components}>
    <main {...props} />
  </MDXProvider>
)
```

### Inspecting types

<Note>
  This only works on the latest alpha version @mdx-js/mdx@next (>= 1.0.0-alpha.7)
</Note>

Sometimes you might want to inspect the element type of that
MDX will be rendering with its custom pragma.  You can use the
wrapper to achieve this because it will have access to the MDX
components as children.  You can check their type by accessing
the `mdxType` in props.

```js
// src/App.js
import React from 'react'

import {MDXProvider} from '@mdx-js/react'

const components = {
  wrapper: ({ children, ...props }) => {
    console.log(children.map(child => child.props.mdxType))
    return <>{children}</>
  }
}

export default props => (
  <MDXProvider components={components}>
    <main {...props} />
  </MDXProvider>
)
```

### Manipulating children

You can also manipulate and modify children.  Here is an example of reordering
them by converting them to an array and calling `reverse`.

```js
// src/App.js
import React from 'react'

import {MDXProvider} from '@mdx-js/react'

const components = {
  wrapper: ({ children, ...props }) => {
    const reversedChildren = React.Children.toArray(children).reverse()
    return <>{reversedChildren}</>
  }
}

export default props => (
  <MDXProvider components={components}>
    <main {...props} />
  </MDXProvider>
)
```

## Related

If you would like to dive deeper, check out
[_A deep dive into children in React_](https://mxstbr.blog/2017/02/react-children-deepdive/)
or Brent Jackson’s [MDX Blocks](https://github.com/jxnblk/mdx-blocks)

* * *

*   <https://mxstbr.blog/2017/02/react-children-deepdive>
*   <https://github.com/jxnblk/mdx-blocks>
