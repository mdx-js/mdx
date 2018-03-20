# MDX: Markdown + JSX Specification [PROPOSAL]

Please feel free to add any thoughts/criticisms/ideas to https://github.com/c8r/markdown/issues/50.

- [`.mdx` proposal](https://spectrum.chat/?t=1021be59-2738-4511-aceb-c66921050b9a)
- [MDXAST proposal](https://github.com/syntax-tree/ideas/issues/3)

A superset of the [CommonMark](http://commonmark.org) specification that adds JSX syntax and `imports`.

## Imports

ES2015 [`import` syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) is supported. They are optional and must be the first declarations in an MDX file

```js
import Component, { And, Another } from './src'
```

## Exports

ES2015 [`export` syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export) is supported. This works similarly to traditional markdown frontmatter where you can specify things like layout and authors.

```js
import { Fred, Ann } from '../data/authors.json'

export { authors: { Fred, Ann } }
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


#### Transclusion via an `import`

```jsx
import GroceryList from './grocery-list.mdx'
import { List } from './ui'

# Grocery List

<List>
  <GroceryList />
</List>
```

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
