# MDX Parcel Plugin

This is an experimental parcel plugin for [MDX Support](https://github.com/mdx-js/mdx).

## Usage

1.  Install:

`npm i @mdx-js/parcel-plugin-mdx --save-dev`

or

`yarn add -D @mdx-js/parcel-plugin-mdx`

2.  Write code!

```jsx
// index.js
import MDXContent from './content.mdx';

...

render(<MDXContent />, root);
```

### Thanks

I couldn't have written this without the following:

- [MDX](https://github.com/mdx-js/mdx)
- [Parcel](https://parceljs.org/)
- [Writing a parcel plugin](https://medium.com/@jasperdemoor/writing-a-parcel-plugin-3936271cbaaa)
