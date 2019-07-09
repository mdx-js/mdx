# Gatsby

To use MDX with [Gatsby][], use [gatsby-plugin-mdx][gatsby-plugin-mdx].

First, scaffold a new Gatsby 2.0 or greater site and install the `gatsby-plugin-mdx`
plugin.

```shell
gatsby new gatsby-site https://github.com/gatsbyjs/gatsby-starter-default#v2
cd gatsby-site
yarn add gatsby-plugin-mdx @mdx-js/mdx@latest @mdx-js/react@latest
```

Then add `gatsby-plugin-mdx` to your `gatsby-config.js` in the `plugins` section.

```javascript
module.exports = {
  siteMetadata: {
    title: `My Ambitious Project`
  },
  plugins: [`gatsby-plugin-mdx`]
}
```

Finally, add an `.mdx` file in the `src/pages` directory.
It “Just Works”.

```markdown
# My first MDX Page

some awesome content
```

For more documentation on programmatically creating pages with Gatsby, see
the [gatsby-plugin-mdx docs][gatsby-and-mdx].

[gatsby]: https://gatsbyjs.org
[gatsby-and-mdx]: https://gatsbyjs.org/docs/mdx/
[gatsby-plugin-mdx]: https://gatsbyjs.org/packages/gatsby-plugin-mdx/
