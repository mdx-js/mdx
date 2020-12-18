# remark-mdx-remove-exports

Deprecated!

Created for but no longer used in [MDX](https://mdxjs.com).
Used to removes MDX@1 `export` nodes.
MDX@2 includes `mdxjsEsm` nodes for both import/exports.
Those can be removed with
[`unist-util-remove`](https://github.com/syntax-tree/unist-util-remove)
used as `remove(tree, 'mdxjsEsm')`.
