# AST

The majority of the MDXAST specification is defined by [MDAST][].
MDXAST is a superset of MDAST, with three additional node types:

- `jsx` (in place of `html`)
- `import`
- `export`

It's also important to note that an MDX document that contains no JSX or imports is a valid MDAST.

### Differences to MDAST

The `import` type is used to provide the necessary block elements to the Remark HTML block parser and for the execution context/implementation.
For example, a webpack [loader][] might want to transform an MDX import by appending those imports.

An `export` is used to emit data from MDX, similarly to traditional markdown frontmatter.

The `jsx` node would most likely be passed to Babel to create functions.

This will also differ a bit in parsing because the remark parser is built to handle particular HTML element types, whereas JSX support will require the ability to parse any tag, and those that self close.

The `jsx`, `import`, and `export` node types are defined below.

#### JSX

The `JSX` ([`ElementNode`](#elementnode)) which contains embedded JSX as a string and `children` ([`ElementNode`](#elementnode)).

```idl
interface JSX <: Element {
  type: "jsx";
  value: "string";
  children: [ElementNode]
}
```

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

#### Import

The `import` ([`Textnode`](#textnode)) contains the raw import as a string.

```idl
interface JSX <: Text {
  type: "import";
}
```

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

The `export` ([`Textnode`](#textnode)) contains the raw export as a string.

```idl
interface JSX <: Text {
  type: "export";
}
```

For example, the following MDX:

```md
export { foo: 'bar' }
```

Yields:

```json
{
  "type": "export",
  "value": "export { foo: 'bar' }"
}
```

## MDXHAST

The majority of the MDXHAST specification is defined by [HAST][].
MDXHAST is a superset of HAST, with four additional node types:

- `jsx`
- `import`
- `export`
- `inlineCode`

It's also important to note that an MDX document that contains no JSX or imports results in a valid HAST.

[MDAST]: https://github.com/syntax-tree/mdast
[HAST]: https://github.com/syntax-tree/hast
[loader]: https://github.com/mdx-js/mdx/tree/master/packages/loader
