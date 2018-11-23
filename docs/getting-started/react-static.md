# React Static

In order to use MDX with [React Static][react-static] you just need to [configure the `webpack` option](https://react-static.js.org/docs/config/#webpack) in `static.config.js`.

First, scaffold a new React Static site:

```shell
react-static create myapp
yarn add @mdx-js/loader
```

Then add the `webpack` field to your `static.config.js`:

```javascript
export default {
  getSiteData: () => ({
    // ...
  }),
  getRoutes: async () => {
    // ...
  },
  webpack: config => {
    config.module.rules.map(rule => {
      // rules is an array of objects, we want the one with the `oneOf` field
      if (
        typeof rule.test !== 'undefined' ||
        typeof rule.oneOf === 'undefined'
      ) {
        return rule;
      }
      // add the mdx-js loader to it
      rule.oneOf.unshift({
        test: /.mdx$/,
        use: ['babel-loader', '@mdx-js/loader']
      });

      return rule;
    });
    return config;
  }
};

```

Finally, add an `.mdx` file anywhere in the `src` directory.
It “Just Works” when you import it.

```markdown
# My first MDX Page

some awesome content
```

[react-static]: http://react-static.js.org
