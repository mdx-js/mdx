# markdown

Styleguide and React friendly markdown rendering based on Remark.

`@compositor/markdown` allows you to write documentation in markdown and expose a live code editor/renderer for React components.
Additionally, you can pass React components that map to to their corresponding html components.

## Installation

```sh
npm install --save @compositor/markdown
```

## Usage

```js
const fs = require('fs')
const md = require('@compositor/markdown')

const doc = fs.readFileSync('file.md', 'utf8')
const components = require('./ui/library')

const reactComponents = md(doc, {
  components,
  mdComponents: {
    h1: components.H1
  }
})

console.log(reactComponents)
```

## Related

- @compositor/styleguide
- unified
- remark
- remark-react
- react-live

## License

MIT

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
