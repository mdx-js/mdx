# @compositor/markdown

Styleguide and React friendly markdown rendering based on Remark with a few added features.

`@compositor/markdown` allows you to expose a live code editor/renderer for JSX and file transclusion.
Additionally, you can pass React components that map to to their corresponding html elements.

### Syntax

In addition to the Markdown spec, there are a few added niceties that you can leverage.

#### Live code editor

By specifying a code block's language to be `.jsx` or `.html` a live code editor will be rendered.

```md
```.jsx
<Hello>World</Hello>
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
- `html`
- `jsx`
- `txt`

#### Images

Embedding images is easier to remember, you can link a url or relative file path.

```md
#### A url

https://c8r-x0.s3.amazonaws.com/lab-components-macbook.jpg

#### A relative path

./my-image.png
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

The library accepts a markdown string, and an options object.

```js
const fs = require('fs')
const md = require('@compositor/markdown')

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
| `toc` | `false` | Generate a [table of contents](https://github.com/remarkjs/remark-toc) |
| `plugins` | `[]` | Additional remark plugins |
| `transclude` | `true` | Opt out of file transclusion |

## Related

- @compositor/styleguide
- markdown
- unified
- remark
- remark-react
- react-live
- remark-toc
- remark-emoji

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
