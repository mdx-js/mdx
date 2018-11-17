# ![MDX][logo]

[![Build Status][build-badge]][build]
[![lerna][lerna-badge]][lerna]
[![Join the community on Spectrum][spectrum-badge]][spectrum]

> Markdown for the component era.

MDX is a format that lets you seamlessly use JSX in your Markdown documents.
You can import components, like interactive charts or notifs, and export
metadata.
This makes writing long-form content with components a blast :rocket:.

See it in action

```jsx
import { Chart } from '../components/chart'

# Here's a chart

The chart is rendered inside our MDX document.

<Chart />
```

:heart: **Powerful**: MDX blends Markdown and JSX syntax to fit perfectly in
React/JSX-based projects.

:computer: **Everything is a component**: Use existing components inside your
MDX and import other MDX files as plain components.

:wrench: **Customizable**: Decide which component is rendered for each Markdown
element (`{ h1: MyHeading }`).

:books: **Markdown-based**: The simplicity and elegance of Markdown remains,
you interleave JSX only when you want to.

:fire: **Blazingly blazing fast**: MDX has no runtime, all compilation occurs
during the build stage.

> [Watch some of these features in action][intro]
>
> “It’s extremely useful for using design system components to render markdown
> and weaving interactive components in with existing markdown.”
>
> — [@chrisbiscardi][tweet]

## Why?

Before MDX, some of the benefits of writing Markdown were lost when integrating
with JSX.
Implementations were often template string-based which required lots of escaping
and cumbersome syntax.

MDX seeks to make writing with Markdown _and_ JSX simpler while being more
expressive.
The possibilities are endless when you combine components (that can even be
dynamic or load data) with the simplicity of Markdown for long-form content.

*   Fast
*   No runtime compilation
*   [Pluggable][remark-plugins]
*   Element to React component mapping
*   React component `import`/`export`
*   Customizable layouts
*   Webpack loader
*   Parcel plugin
*   Next.js plugin
*   Gatsby plugin

## Getting started

```shell
npm init mdx
```

*   [Documentation](https://mdxjs.com)
    *   [Syntax](https://mdxjs.com/syntax)
    *   [Getting Started](https://mdxjs.com/getting-started/)
    *   [Plugins](https://mdxjs.com/plugins)
    *   [Contributing](https://mdxjs.com/advanced/contributing)

## Related

See related projects in the [MDX specification][spec].

## Authors

*   [John Otander][john] ([@4lpine][4lpine]) – [Compositor][] + [Clearbit][]
*   [Tim Neutkens][tim] ([@timneutkens][timneutkens]) – [ZEIT][]
*   [Guillermo Rauch][guillermo] ([@rauchg][rauchg]) – [ZEIT][]
*   [Brent Jackson][brent] ([@jxnblk][jxnblk]) – [Compositor][]

* * *

> [MIT](./license) license

[logo]: ./.github/repo.png

[build]: https://travis-ci.org/mdx-js/mdx

[build-badge]: https://travis-ci.org/mdx-js/mdx.svg?branch=master

[lerna]: https://lernajs.io/

[lerna-badge]: https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg

[spectrum]: https://spectrum.chat/mdx

[spectrum-badge]: https://withspectrum.github.io/badge/badge.svg

[intro]: https://www.youtube.com/watch?v=d2sQiI5NFAM&list=PLV5CVI1eNcJgCrPH_e6d57KRUTiDZgs0u

[tweet]: https://twitter.com/chrisbiscardi/status/1022304288326864896

[remark-plugins]: https://github.com/remarkjs/remark/blob/master/doc/plugins.md

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
