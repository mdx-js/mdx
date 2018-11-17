# AST

This document defines two syntax trees:

*   [MDXAST][], a superset of [mdast][], to represent markdown with embedded JSX
*   [MDXHAST][], a superset of [hast][], to represent HTML with embedded JSX

## MDXAST

The majority of the MDXAST specification is defined by [mdast][].
MDXAST is a superset with the following additional node types:

*   `jsx` (instead of `html`)
*   `comment` (instead of `html` comments)
*   `import`
*   `export`

It’s important to note that any MDX document without those nodes is valid
[mdast][].

### Differences to mdast

The `import` type is used to provide the necessary block elements to the remark
HTML block parser and for the execution context/implementation.
For example, a webpack [loader][] might want to transform an MDX import by
appending those imports.

An `export` is used to emit data from MDX, similarly to traditional markdown
frontmatter.

The `jsx` node would most likely be passed to Babel to create functions.

This will also differ a bit in parsing because the remark parser is built to
handle particular HTML element types, whereas JSX support will require the
ability to parse any tag, and those that self close.

The `jsx`, `comment`, `import`, and `export` node types are defined below.

### Nodes

#### JSX

```idl
interface JSX <: Literal {
  type: "jsx"
}
```

**JSX** (**[Literal][]**) represents embedded JSX.

For example, the following MDX:

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

#### Comment

```idl
interface Comment <: Literal {
  type: "comment"
}
```

**Comment** (**[Literal][]**) represents an embedded comment.

For example, the following MDX:

```markdown
<!--hidden-->
```

Yields:

```json
{
  "type": "comment",
  "value": "<!--hidden-->"
}
```

#### Import

```idl
interface Import <: Literal {
  type: "import"
}
```

**Import** (**[Literal][]**) represents an ECMAScript import statement.

For example, the following MDX:

```md
import Video from '../components/Video'
```

Yields:

```json
{
  "type": "import",
  "value": "import Video from '../components/Video'"
}
```

#### Export

```idl
interface Export <: Literal {
  type: "import"
  default: boolean?
}
```

**Export** (**[Literal][]**) represents an ECMAScript export statement.

An `default` field can be present.
It represents that the export statement is a default export (when true) or not
(when false or not present).

For example, the following MDX:

```md
export { foo: 'bar' }
```

Yields:

```json
{
  "type": "export",
  "default": false,
  "value": "export { foo: 'bar' }"
}
```

## MDXHAST

The majority of the MDXHAST specification is defined by [hast][].
MDXHAST includes all nodes defined by [MDXAST][], except for [Comment][], as
it’s defined by [hast][] already.

[mdxast]: #mdxast

[mdxhast]: #mdxhast

[mdast]: https://github.com/syntax-tree/mdast

[hast]: https://github.com/syntax-tree/hast

[loader]: https://github.com/mdx-js/mdx/tree/master/packages/loader

[literal]: https://github.com/syntax-tree/mdast#literal

[comment]: #comment
