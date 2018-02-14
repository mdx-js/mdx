# `.mdx` - Markdown + JSX Specification [PROPOSAL]

Please feel free to add any thoughts/criticisms/ideas to https://github.com/c8r/markdown/issues/50.

- [`.mdx` proposal](https://spectrum.chat/?t=1021be59-2738-4511-aceb-c66921050b9a)
- [MDXAST proposal](https://github.com/syntax-tree/ideas/issues/3)

A superset of the [CommonMark](http://commonmark.org) specification that adds JSX syntax and `imports`.

## Imports

ES2015 [`import` syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) is supported. They are optional and must be the first declarations in an MDX file

```md
import Component, { And, Another } from './src'
```

## Inline JSX

### From within a paragraph

```md
import { Text } from './ui'

This is a paragraph with <Text.span color='red'>Inline JSX</Text.span>
```

### Standalone

```jsx
import { Logo } from './ui'

# Hello, world!

<Logo />

And here's a paragraph
```

#### Escaping

If you'd like to start a line with the `<` token, you may escape with `\<`.

### Embedding markdown

There's a special `<markdown>` tag which opens up markdown parsing.

```jsx
import { List } from './ui'

# Hello, world!

<List>
  <markdown>
    * here
    * are
    * list
    * items
  </markdown>
</List>
```

#### Escaping

If you'd like to use `<markdown>` as text in your JSX you can escape it with `\</markdown>`.

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

## Expected elements

Any non-HTML element must be declared to the parser. This is used to determine blocks of JSX and ignores any non-conforming elements. For example, if the parser is told to expect `['Video', 'Logo']`:

```jsx
import OtherThing from './ui'


These elements are parsed as JSX blocks:

<OtherThing />

<span>hi</span>

<Video />

<Logo />

But these aren't:

<Span>hi</Span>

<SomethingElse />
```

## Formatting/linting

For all non-mdx specific nodes, a standard md formatter/linter will be applied.
For mdx specific nodes, [prettier](https://github.com/prettier/prettier) will be applied.
