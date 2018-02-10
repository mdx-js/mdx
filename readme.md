# Markdown

A fully-featured markdown parser and renderer for ambitious projects.
Compiles to React for React-based apps or static site generation.
Built with [`remark`](https://github.com/remarkjs/remark) and adapted from [`remark-react`](https://github.com/mapbox/remark-react)/[`mdxc`](https://github.com/jamesknelson/mdxc).

`@compositor/markdown` provides a few added features that improve the Markdown spec, including component imports, inline JSX, frontmatter, and an optional image syntax.

```sh
npm install --save @compositor/markdown
```

## Features

- Fast
- [Pluggable](https://github.com/remarkjs/remark/blob/master/doc/plugins.md)
- React component imports/rendering
- Standalone library for use without React
- Frontmatter support
- Live editor for jsx
- File transclusion
- Simpler image syntax
- Optional table of contents
- GitHub style emojis

### Syntax

In addition supporting the full Markdown spec, this project adds syntactic niceties and plugin options.

#### JSX rendering

By specifying a code block's language to be `.jsx` React will be rendered.
This allows you to tie into syntax highlighting for most text editors.

```md
```.jsx
<Hello>World</Hello>
```

```md
```.jsx
---
liveEditor: true
---
<Hello>World</Hello>
```

##### Frontmatter options

| Name | Default | Description |
| ---- | ------- | ----------- |
| `liveEditor` | `false` | Turn `.jsx` code block into a [live editor](https://github.com/FormidableLabs/react-live) |

#### File transclusion

Since you can import any `.mdx` file as a Markdown component, you can transclude files by importing

```md
import Other from './other.mdx'

# Hello, world!

```.jsx
<Other />
```

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

## Not using React?

`@compositor/markdown` also exports the core library which you can use in other node projects.

```js
import { md } from '@compositor/markdown'

md('# Hello, world!', { skipReact: true })
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
const ui = require('./ui')

const reactComponents = md(doc, {
  components: {
    h1: ui.H1,
    p: ui.Text,
    code: ui.Code,
    Video: ui.Video
  }
})
```

#### Options

| Name | Default | Description |
| ---- | ------- | ----------- |
| `components` | `{}` | Object containing html element to component mapping and any other components to provide to the global scope |
| `toc` | `false` | Generate a [table of contents](https://github.com/remarkjs/remark-toc) |
| `plugins` | `[]` | Additional remark plugins |
| `skipReact` | `false` | Opt out of React component rendering |

## Related

- [markdown](https://daringfireball.net/projects/markdown/syntax)
- [unified](https://github.com/unifiedjs/unified)
- [remark](http://remark.js.org/)
- [remark-react](https://github.com/mapbox/remark-react)
- [mdxc](https://github.com/jamesknelson/mdxc)
- [react-live](https://react-live.philpl.com/)
- [remark-toc](https://github.com/remarkjs/remark-toc)
- [remark-emoji](https://github.com/rhysd/remark-emoji)
- [IA Markdown Content Blocks](https://github.com/iainc/Markdown-Content-Blocks)
- [.mdx proposal](https://spectrum.chat/thread/1021be59-2738-4511-aceb-c66921050b9a)

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
