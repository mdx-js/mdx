# [![MDX][logo]][website]

[![Build Status][build-badge]][build]
[![lerna][lerna-badge]][lerna]
[![Join the community on Spectrum][spectrum-badge]][spectrum]

> Markdown for the component era.

MDX is an authorable format that lets you seamlessly use JSX in your markdown documents.
You can import components, like interactive charts or notifications, and export
metadata.
This makes writing long-form content with components a blast.  🚀

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

*   Fast
*   No runtime compilation
*   [Pluggable][remark-plugins]
*   Element to React component mapping
*   React component `import`/`export`
*   Customizable layouts
*   [Webpack loader](https://mdxjs.com/getting-started/webpack)
*   [Parcel plugin](https://mdxjs.com/getting-started/parcel)
*   [Next.js plugin](https://mdxjs.com/getting-started/next)
*   [Gatsby plugin](https://mdxjs.com/getting-started/gatsby)

## Sponsors

<!--lint ignore no-html maximum-line-length-->

<table>
  <tr valign="top">
    <td width="20%" align="center">
      <a href="https://zeit.co"><img src="https://avatars1.githubusercontent.com/u/14985020?s=400&v=4"></a>
      <br><br>🥇
      <a href="https://zeit.co">ZEIT</a>
    </td>
    <td width="20%" align="center">
      <a href="https://www.gatsbyjs.org"><img src="https://avatars1.githubusercontent.com/u/12551863?s=400&v=4"></a>
      <br><br>🥇
      <a href="https://www.gatsbyjs.org">Gatsby</a></td>
    <td width="20%" align="center">
      <a href="https://compositor.io"><img src="https://avatars1.githubusercontent.com/u/19245838?s=400&v=4"></a>
      <br><br>🥉
      <a href="https://compositor.io">Compositor</a>
    </td>
    <td width="20%" align="center">
      <a href="https://www.holloway.com"><img src="https://avatars1.githubusercontent.com/u/35904294?s=400&v=4"></a>
      <br><br>
      <a href="https://www.holloway.com">Holloway</a>
    </td>
    <td width="20%" align="center">
      <br><br><br><br>
      <a href="https://opencollective.com/unified"><strong>You?</strong>
    </td>
  </tr>
</table>

**[Read more about the unified collective on Medium »][announcement]**

## Authors

*   [John Otander][john] ([@4lpine][4lpine]) – [Compositor][] + [Clearbit][]
*   [Tim Neutkens][tim] ([@timneutkens][timneutkens]) – [ZEIT][]
*   [Guillermo Rauch][guillermo] ([@rauchg][rauchg]) – [ZEIT][]
*   [Brent Jackson][brent] ([@jxnblk][jxnblk]) – [Compositor][]

## Related

See related projects in the [MDX specification][spec].

## Contribute

**MDX** is built by people just like you!
Check out [`contributing.md`][contributing] for ways to get started.

This project has a [Code of Conduct][coc].
By interacting with this repository, organisation, or community you agree to
abide by its terms.

Want to chat with the community and contributors?
Join us on [spectrum][]!

## License

[MIT][] © [Compositor][] and [ZEIT][]

[logo]: .github/repo.png

[build]: https://travis-ci.org/mdx-js/mdx

[build-badge]: https://travis-ci.org/mdx-js/mdx.svg?branch=master

[lerna]: https://lernajs.io/

[lerna-badge]: https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg

[spectrum]: https://spectrum.chat/mdx

[spectrum-badge]: https://withspectrum.github.io/badge/badge.svg

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

[zeit]: https://zeit.co

[clearbit]: https://clearbit.com

[announcement]: https://medium.com/unifiedjs/collectively-evolving-through-crowdsourcing-22c359ea95cc

[contribute]: #contribute

[contributing]: contributing.md

[coc]: code-of-conduct.md

[mdx-deck]: https://github.com/jxnblk/mdx-deck

[mit]: license
