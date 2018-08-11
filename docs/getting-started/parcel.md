import { Message } from 'rebass'

# Parcel

<Message>
  This docs page is a WIP
</Message>

You'll need to install the `@mdx-js/parcel-plugin-mdx` plugin to transpile MDX.

```js
{
  "scripts": {
    "start": "parcel index.html --no-cache"
  },
  "dependencies": {
    "react": "16.4.1",
    "react-dom": "16.4.1",
    "@mdx-js/tag": "@mdx-js/tag"
  },
  "devDependencies": {
    "@mdx-js/parcel-plugin-mdx": "@mdx-js/parcel-plugin-mdx",
    "parcel-bundler": "1.9.0"
  }
}
```
