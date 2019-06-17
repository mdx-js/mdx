# Gatsby

In order to use MDX with [Gatsby][] you can use the [gatsby-mdx][mdx-plugin] package.

First, scaffold a new Gatsby 2.0 or greater site and install the `gatsby-mdx`
plugin.

```shell
gatsby new gatsby-site https://github.com/gatsbyjs/gatsby-starter-default#v2
cd gatsby-site
yarn add gatsby-mdx @mdx-js/mdx@next @mdx-js/react@next
```

Then add `gatsby-mdx` to your `gatsby-config.js` in the `plugins` section.

```javascript
module.exports = {
  siteMetadata: {
    title: `My Ambitious Project`
  },
  plugins: [`gatsby-mdx`]
}
```

Finally, add an `.mdx` file in the `src/pages` directory.
It “Just Works”.

```markdown
# My first MDX Page

some awesome content
```

For more documentation on programmatically creating pages with Gatsby, see
the [gatsby-mdx docs][gatsby-mdx].

[gatsby]: https://gatsbyjs.org
[gatsby-mdx]: https://gatsbyjs.org/docs/mdx/
[mdx-plugin]: https://gatsbyjs.org/packages/gatsby-mdx/
