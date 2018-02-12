# `.mdx` - Markdown + JSX Specification [DRAFT]

A superset of the [CommonMark](http://commonmark.org) specification that adds JSX syntax and `imports`.

## Imports

ES2015 [`import` syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) is supported.
Any 

```md
import Component, { And, Another } from './src'
```

#### Escaping

If you'd like to start a paragraph with the `import` token, you may escape with `\import`.

## Inline JSX

```md
import { Text } from './ui'

This is a paragraph with <Text.span color='red'>Inline JSX</Text.span>
```

## JSX blocks

Any `.jsx` code block will also be parsed as JSX.

```md
import { Hero } from './ui'

# Hello, world!

```.jsx
<Hero
  title='Some Title'
  description={`
    I'm
  
    a
  
    multiline string
  `}
```

#### Escaping

If you'd like to start a line with the `<` token, you may escape with `\<`.

## Element to component mapping

It'd often be desirable to map React components to their HTML element equivalents, adding more flexibility to many usages of React that might not want a plain HTML element as the output.
This is useful for component-centric projects using CSS-in-JS and other similar projects.

This will require a multi step AST implementation, first starting with [MDAST](https://github.com/syntax-tree/mdast) => [HAST](https://github.com/syntax-tree/hast).
This will allow us to tie into both markdown plugins and hyperscript plugins, but can be something completely opaque to end users.

Can be passed as props, or potentially a context provider, but that's implementation specific.

```jsx
import React from 'react'
import * as ui from './ui'

import Doc from './readme.md'

export default () =>
  <Doc
    components={{
      h1: ui.Heading,
      p: ui.Text,
      code: ui.Code
    }}
  />
```

## Formatting/linting

For all non-mdx specific nodes, a standard md formatter/linter will be applied.
For mdx specific nodes, [prettier](https://github.com/prettier/prettier) will be applied.
