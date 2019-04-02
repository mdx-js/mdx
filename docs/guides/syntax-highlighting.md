import { Message } from 'rebass'

# Syntax highlighting

There are two primary approaches for adding syntax highlighting to MDX:

*   composition via the MDXProvider
*   remark plugin

It’s typically preferred to take the compositional approach, but both
will be documented here.

## Composition

The [MDXProvider](https://mdxjs.com/getting-started/#mdxprovider) provides
a way to map components to be rendered for a given Markdown element.  So,
this allows you to choose a specific component for the `code` block.  To
get started you can wrap your app in the MDXProvider and add in a component
to ensure it’s being picked up:

### Using the MDXProvider

```js
// src/App.js
import React from 'react'
import {MDXProvider} from '@mdx-js/tag'

const components = {
  pre: props => <div {...props} />,
  code: props => <pre style={{ color: 'tomato' }} {...props} />
}

export default props => (
  <MDXProvider components={components}>
    <main {...props}>
    </main>
  </MDXProvider>
)
```

When you render your app you should now see the color become `tomato` for
any code block found in your MDX files.

### prism-react-renderer

Now that you have a custom component being rendered for code blocks you can
choose any React component library to handle the syntax highlighting.  A solid
library to choose is [prism-react-renderer](https://github.com/FormidableLabs/prism-react-renderer).

You can install it with:

```sh
yarn add prism-react-renderer
```

#### Build a CodeBlock component

You can essentially cut and paste the entire example into a new
component file.  The only big difference is the MDX will pass in the
code string as `children` so you will need to destructure that prop
and pass it to Highlight as the `code` prop.

```js
// src/CodeBlock.js
import React from 'react'
import Highlight, {defaultProps} from 'prism-react-renderer'

export default ({children}) => {
  return (
    <Highlight {...defaultProps} code={children} language='javascript'>
      {({className, style, tokens, getLineProps, getTokenProps}) => (
        <pre className={className} style={{...style, padding: '20px'}}>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({line, key: i})}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({token, key})} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  )
}
```

Now you should see syntax highlighting in your MDX files.  However, right now
`javascript` is hardcoded as the language.  You will need to take the language
from the code fence and pass it to Highlight directly.  MDX will pass the language
as `className` so you can pull out the language with:

```js
const language = className.replace(/language-/, '')
```

### All together

```js
import React from 'react'
import Highlight, {defaultProps} from 'prism-react-renderer'

export default ({children, className}) => {
  const language = className.replace(/language-/, '')

  return (
    <Highlight {...defaultProps} code={children} language={language}>
      {({className, style, tokens, getLineProps, getTokenProps}) => (
        <pre className={className} style={{...style, padding: '20px'}}>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({line, key: i})}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({token, key})} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  )
}
```

[See the example](https://github.com/mdx-js/mdx/tree/master/examples/syntax-highlighting)

## Remark plugin

In addition to composition you can use any plugin from the remark
ecosystem.  One solid library for syntax highlighting is
[@mapbox/rehype-prism](https://github.com/mapbox/rehype-prism).

```js
// webpack.config.js
const rehypePrism = require('@mapbox/rehype-prism')

module.exports = {
  module: {
    // ...
    rules: [
      // ...
      {
        test: /.mdx?$/,
        use: [
          'babel-loader',
          {
            resolve: '@mdx-js/loader',
            options: {
              hastPlugins[rehypePrism]
            }
          }
        ]
      }
    ]
  }
}
```

[Read more about plugins](https://mdxjs.com/advanced/plugins)
