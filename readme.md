<p align="center">
  <a href="https://mdxjs.com">
    <img alt="MDX logo" src="https://mdx-logo.now.sh" width="60" />
  </a>
</p>

# MDX: Markdown for the component era 🚀

[![Build Status][build-badge]][build]
[![Chat][chat-badge]][chat]

[MDX][website] is an authorable format that lets you seamlessly use JSX in your markdown documents.
You can import components, like interactive charts or notifications, and export
metadata.
This makes writing long-form content with components a blast.

## Example

See MDX in action:

```jsx
import { Chart } from '../components/chart'

# Here’s a chart

The chart is rendered inside our MDX document.

<Chart />
```

## Intro

MDX is markdown for the component era.
It lets you write JSX embedded inside markdown.
That’s a great combination because it allows you to use markdown’s often terse
syntax (such as `# heading`) for the little things and JSX for more advanced
components.

:heart: **Powerful**: MDX blends markdown and JSX syntax to fit perfectly in
React/JSX-based projects.

:computer: **Everything is a component**: Use existing components inside your
MDX and import other MDX files as plain components.

:wrench: **Customizable**: Decide which component is rendered for each markdown
element (`{ h1: MyHeading }`).

:books: **Markdown-based**: The simplicity and elegance of markdown remains,
you interleave JSX only when you want to.

:fire: **Blazingly blazing fast**: MDX has no runtime, all compilation occurs
during the build stage.

> [Watch some of these features in action][intro]

## Getting started

```shell
npm init mdx
```

Visit [`mdxjs.com`][website] for more info, and check out [Contribute][] below
to find out how to help out.

## Why?

Before MDX, some of the benefits of writing markdown were lost when integrating
with JSX.
Implementations were often template string-based which required lots of escaping
and cumbersome syntax.

> “MDX \[…] is extremely useful for using design system components to render
> markdown and weaving interactive components in with existing markdown.”
>
> — [@chrisbiscardi][tweet]

MDX seeks to make writing with markdown _and_ JSX simpler while being more
expressive.
The possibilities are endless when you combine components (that can even be
dynamic or load data) with the simplicity of markdown for long-form content.
A nice example of this is [mdx-deck][], a great way to create slides with MDX.

- Fast
- No runtime compilation
- [Pluggable][remark-plugins]
- Element to React component mapping
- React component `import`/`export`
- Customizable layouts
- [Webpack loader](https://mdxjs.com/getting-started/webpack)
- [Parcel plugin](https://mdxjs.com/getting-started/parcel)
- [Next.js plugin](https://mdxjs.com/getting-started/next)
- [Gatsby plugin](https://mdxjs.com/getting-started/gatsby)

## Sponsors

<!--lint ignore no-html-->

<table>
  <tr valign="top">
    <td width="33.33%" align="center" colspan="2">
      <a href="https://www.gatsbyjs.org">Gatsby</a><br>🥇<br><br>
      <a href="https://www.gatsbyjs.org"><img src="https://avatars1.githubusercontent.com/u/12551863?s=900&v=4"></a>
    </td>
    <td width="33.33%" align="center" colspan="2">
      <a href="https://vercel.com">Vercel</a><br>🥇<br><br>
      <!--OC has a sharper image-->
      <a href="https://vercel.com"><img src="https://images.opencollective.com/vercel/d8a5bee/logo/512.png"></a>
    </td>
    <td width="33.33%" align="center" colspan="2">
      <a href="https://www.netlify.com">Netlify</a><br><br><br>
      <!--OC has a sharper image-->
      <a href="https://www.netlify.com"><img src="https://images.opencollective.com/netlify/4087de2/logo/512.png"></a>
    </td>
  </tr>
  <tr valign="top">
    <td width="16.67%" align="center">
      <a href="https://www.holloway.com">Holloway</a><br><br><br>
      <a href="https://www.holloway.com"><img src="https://avatars1.githubusercontent.com/u/35904294?s=300&v=4"></a>
    </td>
    <td width="16.67%" align="center">
      <a href="https://themeisle.com">ThemeIsle</a><br>🥉<br><br>
      <a href="https://themeisle.com"><img src="https://twitter-avatar.now.sh/themeisle"></a>
    </td>
    <td width="16.67%" align="center">
      <a href="https://boostio.co">BoostIO</a><br>🥉<br><br>
      <a href="https://boostio.co"><img src="https://avatars1.githubusercontent.com/u/13612118?s=300&v=4"></a>
    </td>
    <td width="16.67%" align="center">
      <a href="https://expo.io">Expo</a><br>🥉<br><br>
      <a href="https://expo.io"><img src="https://avatars1.githubusercontent.com/u/12504344?s=300&v=4"></a>
    </td>
    <td width="50%" align="center" colspan="2">
      <br><br><br><br>
      <a href="https://opencollective.com/unified"><strong>You?</strong></a>
    </td>
  </tr>
</table>

## Authors

- [John Otander][john] ([@4lpine][4lpine]) – [Compositor][] + [Clearbit][]
- [Tim Neutkens][tim] ([@timneutkens][timneutkens]) – [Vercel][]
- [Guillermo Rauch][guillermo] ([@rauchg][rauchg]) – [Vercel][]
- [Brent Jackson][brent] ([@jxnblk][jxnblk]) – [Compositor][]

## Related

See related projects in the [MDX specification][spec].

## Contribute

**MDX** is built by people just like you!
See the [Support][] and [Contributing][] guidelines on the MDX website for ways
to (get) help.

This project has a [Code of Conduct][coc].
By interacting with this repository, organisation, or community you agree to
abide by its terms.

Want to chat with the community and contributors?
Join us on [GH Discussions][chat]!

## License

[MIT][] © [Compositor][] and [Vercel][]

[build]: https://github.com/mdx-js/mdx/actions?query=workflow%3A%22CI%22
[build-badge]: https://github.com/mdx-js/mdx/workflows/CI/badge.svg
[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg
[chat]: https://github.com/mdx-js/mdx/discussions
[intro]: https://www.youtube.com/watch?v=d2sQiI5NFAM&list=PLV5CVI1eNcJgCrPH_e6d57KRUTiDZgs0u
[tweet]: https://twitter.com/chrisbiscardi/status/1022304288326864896
[remark-plugins]: https://github.com/remarkjs/remark/blob/master/doc/plugins.md
[website]: https://mdxjs.com
[spec]: https://github.com/mdx-js/specification#related
[john]: https://johno.com
[tim]: https://github.com/timneutkens
[guillermo]: https://rauchg.com
[brent]: https://jxnblk.com
[4lpine]: https://twitter.com/4lpine
[rauchg]: https://twitter.com/rauchg
[timneutkens]: https://twitter.com/timneutkens
[jxnblk]: https://twitter.com/jxnblk
[compositor]: https://compositor.io
[vercel]: https://vercel.com
[clearbit]: https://clearbit.com
[contribute]: #contribute
[contributing]: https://mdxjs.com/contributing
[support]: https://mdxjs.com/support
[coc]: https://github.com/mdx-js/.github/blob/master/code-of-conduct.md
[mdx-deck]: https://github.com/jxnblk/mdx-deck
[mit]: license
