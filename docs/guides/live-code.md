If you haven’t read the syntax highlighting guide it’s recommended start there.

[Read syntax highlighting guide](/guides/syntax-highlighting)

# Live code

An increasingly common approach for live code editors is to overload the
code block.  This is often done so that the code shows up nicely when rendered
to GitHub and it’s a nice usage of meta strings.

## Code block meta string

After the language in code fences you can add `key=value` pairs which will
be automatically passed as props to your code block.

````md
  ```js live=true
````

## Component

If `live` isn’t passed to the code component you can render syntax highlighting.
If `live` is present you can return [react-live][].

```js
// src/components/CodeBlock.js
import React from 'react'
import Highlight, {defaultProps} from 'prism-react-renderer'
import {LiveProvider, LiveEditor, LiveError, LivePreview} from 'react-live'

export default ({children, className, live}) => {
  const language = className.replace(/language-/, '')

  if (live) {
    return (
      <div style={{marginTop: '40px'}}>
        <LiveProvider code={children}>
          <LivePreview />
          <LiveEditor />
          <LiveError />
        </LiveProvider>
      </div>
    )
  }

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

## Passing to the MDXProvider

Now that you have a code block component you need to pass it to
MDXProvider in the components object so that it is rendered.

```js
// src/App.js
import React from 'react'
import {MDXProvider} from '@mdx-js/tag'

import CodeBlock from './components/CodeBlock'

const components = {
  pre: props => <div {...props} />,
  code: CodeBlock
}
export default props => (
  <MDXProvider components={components}>
    <main {...props}>
    </main>
  </MDXProvider>
)
```

[react-live]: https://github.com/FormidableLabs/react-live
