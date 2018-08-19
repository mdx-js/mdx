import { Border, Blockquote, BlockLink } from 'rebass'

# MDX

### Markdown for the component era.

MDX is a format that lets you seamlessly use JSX in your Markdown documents.
You can import components, like interactive charts or notifs, and export metadata.
This makes writing long-form content with components a blast :rocket:.

#### Try it

```.mdx
# Hello, world!

Here's an example of the [Rebass](https://jxnblk.com/rebass)
Donut rendered inside an MDX document.

<Donut value={2/3} />
```

__:heart: Powerful__: MDX blends Markdown and JSX syntax to fit perfectly in React/JSX-based projects.

__:computer: Everything is a component__: Use existing components inside your MDX and import other MDX files as plain components.

__:wrench: Customizable__: Decide which component is rendered for each Markdown element (`{ h1: MyHeading }`).

__:books: Markdown-based__: The simplicity and elegance of Markdown remains, you interleave JSX only when you want to.

__:fire: Blazingly blazing fast__: MDX has no runtime, all compilation occurs during the build stage.

> “It's extremely useful for using design system components to render markdown
and weaving interactive components in with existing markdown.”
>
> — [@chrisbiscardi](https://twitter.com/chrisbiscardi/status/1022304288326864896)

## Why?

Before MDX, some of the benefits of writing Markdown were lost when integrating with JSX.
Implementations were often template string-based which required lots of escaping and cumbersome syntax.

MDX seeks to make writing with Markdown _and_ JSX simpler while being more expressive.
The possibilities are endless when you combine components (that can even be dynamic or load data) with the simplicity of Markdown for long-form content.

## Features

- Fast
- No runtime compilation
- [Pluggable][remark-plugins]
- Element to React component mapping
- React component `import`/`export`
- Customizable layouts
- Webpack loader
- Parcel plugin
- Next.js plugin
- Gatsby plugin

> [Watch some of these features in action](https://www.youtube.com/watch?v=d2sQiI5NFAM&list=PLV5CVI1eNcJgCrPH_e6d57KRUTiDZgs0u)

[md]: http://commonmark.org/
[jsx]: https://facebook.github.io/jsx/
[remark-plugins]: https://github.com/remarkjs/remark/blob/master/doc/plugins.md
