import { Border, Blockquote, BlockLink } from 'rebass'

# MDX

### Markdown for the component era

MDX is an authorable format that lets you seamlessly use JSX in your Markdown
documents.  You can import components, like interactive charts or notifs, and
embed them within your content.  This makes writing long-form content with
components a blast :rocket:.

#### Try it

```.mdx
# Hello, *world*!

Below is an example of JSX embedded in Markdown. <br /> **Try and change
the background color!**

<div style={{ padding: '20px', backgroundColor: 'tomato' }}>
  <h3>This is JSX</h3>
</div>
```

:heart: **Powerful**: MDX blends markdown and JSX syntax to fit perfectly in
JSX-based projects.

:computer: **Everything is a component**: Use existing components inside your
MDX and import other MDX files as plain components.

:wrench: **Customizable**: Decide which component is rendered for each markdown
element.

:books: **Markdown-based**: The simplicity and elegance of Markdown remains,
you interleave JSX only when you want to.

:fire: **Blazingly blazing fast**: MDX has no runtime, all compilation occurs
during the build stage.

> “It’s extremely useful for using design system components to render markdown
> and weaving interactive components in with existing markdown.”
>
> — [@chrisbiscardi][quote]

## Why?

Before MDX, some of the benefits of writing Markdown were lost when integrating
with JSX.  Implementations were often template string-based which required lots
of escaping and cumbersome syntax.

MDX seeks to make writing with Markdown _and_ JSX simpler while being more
expressive.  The possibilities are endless when you combine components (that can
even be dynamic or load data) with the simplicity of Markdown for long-form content.

> [Watch some of these features in action][intro]

[quote]: https://twitter.com/chrisbiscardi/status/1022304288326864896

[intro]: https://www.youtube.com/watch?v=d2sQiI5NFAM&list=PLV5CVI1eNcJgCrPH_e6d57KRUTiDZgs0u
