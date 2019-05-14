# Components

The MDX core library accepts a string and exports a JSX string
that represents a component (via [code generation][code-generation]).
It uses a [custom pragma](/blog/custom-pragma) which customizes
the rendering of elements in Markdown and JSX.

## Compilation

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
import MyComponent from './my-component'

export const author = 'Fred Flintstone'

const layoutProps = { author }
export default function MDXContent({ components, ...props }) => (
  <wrapper {...props} {...layoutProps}>
    <h1>Title</h1>
    <MyComponent />
    <p>Lorem ipsum dolor sit amet.</p>
  </wrapper>
)

MDXContent.isMDXComponent = true
```

If the component mapping contains a `p` key, that will be used for
`Lorem ipsum dolor sit amet.`.
Otherwise a standard `p` tag is rendered (`<p>Lorem ipsum dolor sit amet.</p>`).
This is what allows you to pull in existing components to style your MDX
documents via the [MDXProvider](#mdxprovider).

### Layout props

You’ll also notice that `layoutProps` is created based on your exports
and then passed to the wrapper.  This allows for the wrapper to use
those props automatically for handling things like adding an author
bio to the wrapped document.

## `makeShortcodes`

There is one other function added to the compiled output: `makeShortcodes`.
This is added for [shortcode support](/blog/shortcodes).  It’s used in order
to stub any components that aren’t directly imported so that there won’t be
any `ReferenceError`s.  If they’re passed to the `MDXProvider`, the custom
JSX pragma will pull the component from context and use that in place of the
stubbed `Button`:

```js
const makeShortcode = name => function MDXDefaultShortcode(props) {
  console.warn("Component " + name + " was not imported, exported, or provided by MDXProvider as global scope")
  return <div {...props}/>
}

// This will be ignored by MDX if you wrap your MDX document with
// <MDXProvider components={{ Button: MyCustomButton }}>
const Button = makeShortcode("Button")
```

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

If you need to change the mapping during runtime, declare it on the componentʼs
state object:

```js
import React from 'react'
import { MDXProvider } from '@mdx-js/react'

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

You can now use the `setState` function to update the mapping object and be
assured that it wonʼt trigger unnecessary renders.

[code-generation]: https://en.wikipedia.org/wiki/Code_generation_(compiler)
