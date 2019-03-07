### Babel configuration

You will also need to configure babel to support the language features that
MDX uses. One way you can achieve that is using the following `.babelrc`
at your project root.

```json
{
  "presets": [
    "@babel/env",
    "@babel/react"
  ],
  "plugins": [
    "@babel/proposal-object-rest-spread"
  ]
}
```

And installing the dependencies:

```sh
npm install --save-dev @babel/preset-env @babel/preset-react @babel/plugin-proposal-object-rest-spread
```

[babel]: https://babeljs.io
