# Introduction

MDX combines the power of [Markdown][md] with the power of [JSX][jsx].
In essence, it's full-fledged JSX in Markdown.

## Why?

Before MDX, the benefits of writing Markdown were lost when integrating with JSX.
Implementations were often template string-based which required lots of escaping and other cumbersome syntax.

MDX seeks to make writing with Markdown _and_ JSX simpler while still being more expressive.
The possibilities are endless when you combine components (that can even by dynamic or load data) with the simplicity of Markdown for long-form content.

## Features

- Fast
- No runtime compilation
- [Pluggable][remark-plugins]
- Element to React component mapping
- React component `import`/`export`
- Customizable layouts
- Webpack loader

## What's next?

- Parcel bundling
- Editor support
- Linting support
- Prettier support
- Further improved parsing

[md]: http://commonmark.org/
[jsx]: https://facebook.github.io/jsx/
[remark-plugins]: https://github.com/remarkjs/remark/blob/master/doc/plugins.md
