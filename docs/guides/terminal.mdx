import { Tweet } from '@blocks/kit'

# Terminal

With MDX you can render to the command line using [Ink][].
This is a great way to log structured text for welcome screens,
options, or even error messages.

## How it works

Ink is a toolkit that lets you render React to the terminal, so
with very little work you can also render MDX using the
[runtime library][runtime].
This library handles MDX transpilation and evaluating the output
React code.
Ink then handles the resulting DOM structure and outputs a CLI
string.

## Install MDX runtime

In order to use MDX you’ll have to use [the MDX runtime][runtime].

```sh
yarn add @mdx-js/runtime
```

## Using components

Ink provides built in components for layout and color which you can
use with the MDXProvider to customize the functionality and appearance
of components.

Create a `components` object and pass it to the MDXProvider.
It’s important to ensure that the MDXProvider wraps the MDX runtime
component.

```js
const React = require('react')
const {Text, render} = require('ink')
const {MDXProvider} = require('@mdx-js/react')
const MDX = require('@mdx-js/runtime')

const components = {
  h1: ({ children }) => <Text bold>{children}</Text>,
  p: ({ children }) => <Text>{children}</Text>
}

render(
  <MDXProvider components={components}>
    <MDX>{MDXContent}</MDX>
  </MDXProvider>
);
```

You can also provide other components to the runtime scope for additional
functionality.

```js
const components = {
  Box,
  Color,
  Text,
  h1: ({ children }) => <Text bold>{children}</Text>,
  p: ({ children }) => <Text>{children}</Text>
}
```

This will allow you to write content like the following
(and render it to the terminal!):

```mdx
# Hello, world!

From <Color bgBlack white bold>    MDX!    </Color>

<Box marginTop={1}>
  <Color bgCyan white bold>
    I'm a cyan box!
  </Color>
</Box>
```

## All together

```js
const React = require('react');
const {render, Color, Box, Text} = require('ink');
const MDX = require('@mdx-js/runtime')
const { MDXProvider } = require('@mdx-js/react')

const MDXContent = `
# Hello, world!

From <Color bgBlack white bold>    MDX!    </Color>

<Box marginTop={1}>
  <Color bgCyan white bold>
    I'm a cyan box!
  </Color>
</Box>
`

const components = {
  Box,
  Color,
  h1: ({ children }) => <Text bold>{children}</Text>,
  p: ({ children }) => <Text>{children}</Text>
}

render(
  <MDXProvider components={components}>
    <MDX>{MDXContent}</MDX>
  </MDXProvider>
);
```

<Tweet tweetId="1141781114786160641" />

[See the full example](https://github.com/mdx-js/mdx/tree/master/examples/cli)

[ink]: https://github.com/vadimdemedes/ink

[runtime]: https://mdxjs.com/advanced/runtime
