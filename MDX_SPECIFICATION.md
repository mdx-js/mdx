# `.mdx` - Markdown + JSX Specification

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

## Formatting/linting

For all non-mdx specific nodes, a standard md formatter/linter will be applied.
For mdx specific nodes, [prettier](https://github.com/prettier/prettier) will be applied.
