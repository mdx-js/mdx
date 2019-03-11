# Components

The MDX core library accepts a string and exports a JSX string.

## MDXTag

MDXTag is an internal component that MDX uses to map components to an HTML
element based on the Markdown syntax.

Consider the following MDX:

```markdown
import MyComponent from './my-component'

export const author = 'Fred Flintstone'

# Title

<MyComponent />

Lorem ipsum dolor sit amet.
```

MDX core turns that text into roughly the following JSX to be consumed by your
app:

```jsx
import React from 'react'
import { MDXTag } from '@mdx-js/tag'
import MyComponent from './my-component'

export const author = 'Fred Flintstone'

const layoutProps = { author }
export default ({ components, ...props }) => (
  <MDXTag name="wrapper" components={components} {...layoutProps}>
    <MDXTag name="h1" components={components}>
      Title
    </MDXTag>
    <MyComponent />
    <MDXTag name="p" components={components}>
      Lorem ipsum dolor sit amet.
    </MDXTag>
  </MDXTag>
)
```

If the component mapping contains a `p` key, that will be used for
`Lorem ipsum dolor sit amet.`.
Otherwise a standard `p` tag is rendered (`<p>Lorem ipsum dolor sit amet.</p>`).
This is what allows you to pull in existing components to style your MDX
documents.

### Layout props

You’ll also notice that `layoutProps` is created based on your exports
and then passed to the wrapper.  This allows for the wrapper to use
those props automatically for handling things like adding an author
bio to the wrapped document.

## `isMDXComponent`

If you need to check whether a React component has been created by MDX,
all MDX components have a static property `isMDXComponent`:

```jsx
import React from 'react'
import ChangeLog from '../changelog.mdx'

export default () => (
  <div>
    <p>Component type: {ChangeLog.isMDXComponent ? 'MDX' : 'Regular'}</p>
    <ChangeLog />
  </div>
)
```

## MDXProvider

### Caveats

Because MDXProvider uses React Context directly, it is affected by
the same caveats.  It is therefore important that you do not declare
your components mapping inline in the JSX.  Doing so will trigger a rerender
of your entire MDX page with every render cycle.  Not only is this bad for
performance, but it can cause unwanted side affects, like breaking in-page
browser navigation.

Avoid this by following declaring your mapping as a constant.

#### Updating the mapping object during application runtime

If you need to change the mapping during runtime, declare it on the componentʼs state object:

```js
import React from 'react'
import { MDXProvider } from '@mdx-js/tag'

import { Heading, Text, Pre, Code, Table } from './components'

export default class Layout extends React.Component {
  state = {
    h1: Heading.H1,
    h2: Heading.H2,
    // ...
    p: Text,
    code: Pre,
    inlineCode: Code
  }

  render() {
    return (
      <MDXProvider components={this.state}>
        <main {...this.props} />
      </MDXProvider>
    )
  }
}
```

You can now use the `setState` function to update the mapping object and be assured that it wonʼt trigger unnecessary renders.
