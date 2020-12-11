# [remark][]-[mdx][]-remove-imports

[![Build Status][build-badge]][build]
[![lerna][lerna-badge]][lerna]
[![Join the community on Spectrum][spectrum-badge]][spectrum]

Deprecated!

Created for but no longer used in [MDX](https://mdxjs.com).

Used to removes MDX@1 `import` nodes.
MDX@2 includes `mdxjsEsm` nodes for both import/exports.
Those can be removed with
[`unist-util-remove`](https://github.com/syntax-tree/unist-util-remove)
used as `remove(tree, 'mdxjsEsm')`.

## License

[MIT][] © [John Otander][johno]

[build]: https://travis-ci.com/mdx-js/mdx
[build-badge]: https://travis-ci.com/mdx-js/mdx.svg?branch=master
[lerna]: https://lernajs.io/
[lerna-badge]: https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg
[spectrum]: https://spectrum.chat/mdx
[spectrum-badge]: https://withspectrum.github.io/badge/badge.svg
[contributing]: https://mdxjs.com/contributing
[support]: https://mdxjs.com/support
[coc]: https://github.com/mdx-js/.github/blob/master/code-of-conduct.md
[mit]: license
[remark]: https://github.com/remarkjs/remark
[johno]: https://johno.com
[npm]: https://docs.npmjs.com/cli/install
[mdx]: https://mdxjs.com
[mdxast]: https://github.com/mdx-js/specification#mdxast
