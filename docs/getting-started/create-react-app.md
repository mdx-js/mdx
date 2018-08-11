import { Message } from 'rebass'

# Create React App

<Message>
  This docs page is a WIP
</Message>

With Create React App you will need to use [`create-react-app-rewired`][cra-rewired] and add a `config-overrides.js`.

```js
const { getBabelLoader } = require('react-app-rewired')
module.exports = (config, env) => {
  const babelLoader = getBabelLoader(config.module.rules)
  config.module.rules.map(rule => {
    if (typeof rule.test !== 'undefined' || typeof rule.oneOf === 'undefined') {
      return rule
    }

    rule.oneOf.unshift({
      test: /\.mdx$/,
      use: [
        {
          loader: babelLoader.loader,
          options: babelLoader.options
        },
        '@mdx-js/loader'
      ]
    })

    return rule
  })
  return config
}
```

[See the full example][cra-example]

[cra]: https://github.com/facebook/create-react-app
[cra-rewired]: https://github.com/timarney/react-app-rewired
[cra-example]: https://github.com/mdx-js/mdx/tree/master/examples/create-react-app
