import { Button } from '@rebass/emotion'

# AST

export const AST_EXPLORER_LINK = 'https://astexplorer.net/#/gist/2befce6edce1475eb4bbec001356b222/35997d3b44347daabad8dd1a107adc22dd873de2'

<Button as="a" href={AST_EXPLORER_LINK}>Explore the AST</Button>

MDX, the library, uses not one but two syntax trees.
The first, [MDXAST][], represents markdown with embedded JSX, and is a superset of [mdast][].
The second, [MDXHAST][], represent HTML with embedded JSX, and is a superset of [hast][].

MDX includes a [specification][] to define the syntax and transpilation.
It’s based on the [remark][]/[rehype][]/[unified][] ecosystems to ensure robust
parsing and the ability to leverage plugins from within your MDX.
This can be leveraged by code formatters, linters, and implementations in other
languages created by the community.

## MDXAST

The majority of the MDXAST specification is defined by [mdast][].
MDXAST is a superset with the following additional node types:

*   `jsx` (instead of `html`)
*   `comment` (instead of `html` comments)
*   `import`
*   `export`

Any MDX document without those constructs is valid [mdast][].

For more information, see the [MDXAST][] specification.

## MDXHAST

The majority of the MDXHAST specification is defined by [hast][].
MDXHAST includes all nodes defined by [MDXAST][], except for [Comment][], as
it’s defined by [hast][] already.

MDXAST defines the following additional node types:

*   `jsx` (instead of `html`)
*   `import`
*   `export`
*   `inlineCode`

`inlineCode` is there to accurately represent Markdown’s inline code.

For more information, see the [MDXHAST][] specification.

[mdxast]: #mdxast

[mdxhast]: #mdxhast

[comment]: #comment

[mdast]: https://github.com/syntax-tree/mdast

[hast]: https://github.com/syntax-tree/hast

[specification]: https://github.com/mdx-js/specification

[remark]: https://github.com/remarkjs/remark

[rehype]: https://github.com/rehypejs/rehype

[unified]: https://github.com/unifiedjs/unified
