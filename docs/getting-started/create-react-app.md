# Create React App

Please note there’s a [known bug][] with
the macro so live reloading doesn’t
currently work.

With Create React App you will need to use
[`mdx.macro`][mdx-macro].

```sh
npx create-react-app my-app
yarn add mdx.macro
```

Then create the following `src/App.js`:

```js
// src/App.js

import React, { lazy, Component, Suspense } from 'react';
import { importMDX } from 'mdx.macro';

const Content = lazy(() => importMDX('./Content.mdx'));

class App extends Component {
  render() {
    return (
      <div>
        <Suspense fallback={<div>Loading...</div>}>
          <Content />
        </Suspense>
      </div>
    );
  }
}

export default App;
```

And then create the following `src/Content.mdx`:

```md
# Hello, world!
```

[See the full example][cra-example]

[mdx-macro]: https://www.npmjs.com/package/mdx.macro

[cra-example]: https://github.com/mdx-js/mdx/tree/master/examples/create-react-app

[known bug]: https://github.com/facebook/create-react-app/issues/5580
