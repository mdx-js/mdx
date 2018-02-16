# MDX Abstract Syntax Tree

Please feel free to add any thoughts/criticisms/ideas to [c8r/markdown#50](https://github.com/c8r/markdown/issues/50) or [syntax-tree/ideas#3](https://github.com/syntax-tree/ideas/issues/3).

These are nothing more than preliminary thoughts on how an abstract syntax tree (AST) might be structured of the MDX specification.

## Why?

Having a formalized AST will allow for easy integration with linters, syntax highlighters, and code formatters.
This will also ensure that parsing is properly handled before transforming to JSX/Hyperscript/React/etc and potentially leveraging existing plugin ecosystems (like remark) or creating a new ecosystem altogether.

## How is this different than MDAST/HAST?

Firstly, the most important difference is that there isn't much of one. An MDX document that contains no JSX or imports is a valid MDAST.

The MDXAST is nearly identical to MDAST but with a two added node types (`jsx`, `import`) and the removal of `html` (since all tag embeds, including inline are now `jsx`).
The `import` type is used to provide the necessary block elements to the remark html block parser and for the execution context/implementation.
For example, a [webpack loader](https://github.com/c8r/markdown/tree/master/loader) might want to transform an MDX import by appending those imports.
The `jsx` node would most likely be passed to Babel to create functions.

This will also differ a bit in parsing because the remark parser is built to handle particular html element types, whereas JSX support will require the ability to parse _any_ tag, and those that self close.

The `jsx` and `import` node types are defined below.

**M**ark**d**own + JS**X** **A**bstract **S**yntax **T**ree.

---

*   [AST](#ast)
    *   [JSX](#jsx)
    *   [Import](#import)
    *   [MDAST Nodes](https://github.com/syntax-tree/mdast)

## AST

### `JSX`

`JSX` ([`ElementNode`](#elementnode)) which contains embedded JSX as a string and `children` ([`ElementNode`](#elementnode)).

```idl
interface JSX <: Element {
  type: "jsx";
  value: "string";
  children: [ElementNode]
}
```

For example, the following mdx:

```jsx
<Heading hi='there'>
  Hello, world!
</Heading>
```

Yields:

```json
{
  "type": "jsx",
  "value": "<Heading hi='there'>\n  Hello, world!\n</Heading>"
}
```

### `Import`

`import` ([`Textnode`](#textnode)) contains the raw import as a string.

```idl
interface JSX <: Text {
  type: "import";
}
```

For example, the following MDX:

```md
import * as ui from './ui'
```

Yields:

```json
{
  "type": "jsx",
  "value": "import * as ui from './ui'",
  "imports": [
    {
      "type": "star",
      "name": "ui",
      "from": "./ui"
    }
  ]
}
```
