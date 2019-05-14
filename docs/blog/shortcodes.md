import { Button } from '@rebass/emotion'

[MDX Blog](/blog)

# Shortcodes

An exciting new feature in MDX v1 is global shortcodes.  This
allows you to expose components to all of your documents in
your app or website.  This is a useful feature for common
components like YouTube embeds, Twitter cards, or anything
else frequently used in your documents.

If you have an application wrapper for your MDX documents
you can add in components with the `MDXProvider`:

```js
// src/App.js
import React from 'react'
import { MDXProvider } from '@mdx-js/react'
import { YouTube, Twitter, TomatoBox } from './ui'

const shortcodes = { YouTube, Twitter, TomatoBox }

export default ({ children }) => (
  <MDXProvider components={shortcodes}>
    {children}
  </MDXProvider>
)
```

Then, any MDX document that’s wrapped in `App` has access to
`YouTube`, `Twitter`, and `TomatoBox`.  Shortcodes are nothing
more than components, so you can reference them anywhere in an
MDX document with JSX.

`example.mdx`

```md
# Hello world!

Here’s a YouTube shortcode:

<YouTube tweetId="1234" />

Here’s a YouTube shortcode wrapped in TomatoBox:

<TomatoBox>
  <YouTube videoId="1234" />
</TomatoBox>
```

That’s it.  :tada: :rocket:

<Button href="https://codesandbox.io/s/github/mdx-js/mdx/tree/master/examples/shortcodes">
  Try it on CodeSandbox
</Button>

* * *

Huge thanks to [Chris Biscardi](https://christopherbiscardi.com)
for building out most of this functionality.

* * *

Written by [John Otander](https://johno.com)

**[&lt; Back to blog](/blog)**
