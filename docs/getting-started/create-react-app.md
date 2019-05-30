# Create React App

With Create React App you will need to use
[`mdx-loader`][mdx-loader].

```sh
npx create-react-app my-app
yarn add mdx-loader --dev
```

Then create a `.babelrc` file in the root level of your project with the following contents:

```
{
    "presets": ["babel-preset-react-app"]
}
```

Then, you can import a component from any Markdown file by prepending the filename with `!babel-loader!mdx-loader!`. For example:

```
/* eslint-disable import/no-webpack-loader-syntax */
import MyDocument from '!babel-loader!mdx-loader!../pages/index.md'
```

Create a markdown document `src/document.mdx`

```mdx
---
title: My Document
---

This is **markdown** with <span style={{ color: "red" }}>JSX</span>!

```

Then create the following `src/App.js`:

```js
// src/App.js

import React, { Component } from 'react'
/* eslint-disable import/no-webpack-loader-syntax */
import Document, { frontMatter, tableOfContents } from '!babel-loader!mdx-loader!./document.md'
 
class App extends Component {
  render() {
    return (
      <div>
        <h1>{frontMatter.title}</h1>
        <Document />
      </div>
    );
  }
}

export default App;
```

[See the full example][cra-example]

[mdx-loader]: https://www.npmjs.com/package/mdx-loader

[cra-example]: https://github.com/mdx-js/mdx/tree/master/examples/create-react-app
