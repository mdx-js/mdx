# React Static

In order to use MDX with [React Static][react-static] you just need to [configure the `webpack` option](https://react-static.js.org/docs/config/#webpack) in `static.config.js`.

First, scaffold a new React Static site:

```shell
react-static create myapp
yarn add @mdx-js/loader
```

Then add the following to the `webpack` field to your `node.api.js`:

```javascript
export default () => ({
  webpack: config => {
    config.module.rules.map(rule => {
      if (
        typeof rule.test !== 'undefined' ||
        typeof rule.oneOf === 'undefined'
      ) {
        return rule
      }

      rule.oneOf.unshift({
        test: /.mdx$/,
        use: ['babel-loader', '@mdx-js/loader']
      })

      return rule
    })

    return config
  }
})

```

Finally, add an `.mdx` file anywhere in the `src` directory.
It “Just Works” when you import it.

```markdown
# My first MDX Page

some awesome content
```

[react-static]: http://react-static.js.org
