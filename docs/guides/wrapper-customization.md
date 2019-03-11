import { Message } from 'rebass'

# Wrapper customization

The [wrapper](/getting-started#using-the-wrapper) component can be used
to set the layout for the MDX document.  It's often used to set container
width, borders, background colors, etc.  However, it's also unique because
it has access to the children passed to it.

This means that you can do powerful things with the MDX document elements.
If you aren't very familiar with React children, it might be worthwile to
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

### Reordering components

```js
src/App.js
import React from 'react'

import {MDXProvider} from '@mdx-js/tag'

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

*   <https://mxstbr.blog/2017/02/react-children-deepdive>
*   <https://github.com/jxnblk/mdx-blocks>
