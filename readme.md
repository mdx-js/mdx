# Markdown

A fully-featured markdown parser and renderer for ambitious projects.
Compiles to React for React-based apps or static site generation.
Built with [`remark`](https://github.com/remarkjs/remark) and adapted from [`remark-react`](https://github.com/mapbox/remark-react).

`@compositor/markdown` provides a few added features that improve the Markdown spec, including file transclusion and an optional image syntax.

## Features

- Fast
- Live JSX and HTML editors (Styleguide ready)
- [Pluggable](https://github.com/remarkjs/remark/blob/master/doc/plugins.md)
- React component rendering
- Standalone library for use without React
- File transclusion
- Simpler image syntax
- Optional table of contents
- GitHub style emojis

### Not using React?

`@compositor/markdown` also exports the core library which you can use in other node projects.

```js
import { md } from '@compositor/markdown'

md('# Hello, world!', { skipReact: true })
```

_Note:_ This won't include the React-based live code editor for JSX/HTML.

### Syntax

In addition supporting the full Markdown spec, this project adds syntactic niceties and plugin options.

#### Live code editor

By specifying a code block's language to be `.jsx` or `.html` a live code editor will be rendered.

```md
```.jsx
<Hello>World</Hello>
\```
```

#### JSX rendering

Components that are provided in scope can also be rendered in a code block when the language is specified to be `!jsx`.

```ms
```!jsx
<Box color='blue'>Hello, world</Box>
\```
```

#### File transclusion

You can reference content from a shared, relative file and it will be included in the rendered output:

```md
# Hello, world!

./license.md
```

##### Supported file types

- `md`
- `html` (coming soon)
- `jsx` (coming soon)
- `txt` (coming soon)

#### Images

Embedding images is easier to remember, you can link a url or relative file path.

```md
#### A url

https://c8r-x0.s3.amazonaws.com/lab-components-macbook.jpg
```

##### Supported file types

- `png`
- `svg`
- `jpg`

## Installation

```sh
npm install --save @compositor/markdown
```

## Usage

### Component

```jsx
import { Markdown } from '@compositor/markdown'

export default <Markdown text='# Hello, world!' />
```

### Core library usage

The library accepts a markdown string, and an options object.

```js
const fs = require('fs')
const { md } = require('@compositor/markdown')

const doc = fs.readFileSync('file.md', 'utf8')
const library = require('./ui/library')

const reactComponents = md(doc, {
  components: {
    h1: components.H1,
    p: components.Text,
    code: components.Code
  }
})
```

#### Options

| Name | Default | Description |
| ---- | ------- | ----------- |
| `components` | `{}` | Object containing html element to component mapping |
| `LiveEditor` | [`src/lib/LiveEditor`](https://github.com/c8r/markdown/blob/master/src/lib/LiveEditor.js) | Override the default editor component |
| `scope` | `{}` | Object containing components available in the live editor |
| `toc` | `false` | Generate a [table of contents](https://github.com/remarkjs/remark-toc) |
| `plugins` | `[]` | Additional remark plugins |
| `transclude` | `true` | Opt out of file transclusion |
| `skipReact` | `false` | Opt out of React component rendering |
| `props` | `undefined` | Apply default properties to components in html element mapping |

## Related

- [markdown](https://daringfireball.net/projects/markdown/syntax)
- [unified](https://github.com/unifiedjs/unified)
- [remark](http://remark.js.org/)
- [remark-react](https://github.com/mapbox/remark-react)
- [react-live](https://react-live.philpl.com/)
- [remark-toc](https://github.com/remarkjs/remark-toc)
- [remark-emoji](https://github.com/rhysd/remark-emoji)
- [IA Markdown Content Blocks](https://github.com/iainc/Markdown-Content-Blocks)

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

***

[Made by Compositor](https://compositor.io/)
|
[MIT License](license)
