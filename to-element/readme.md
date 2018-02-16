# to-element

JSX string renderer utility.

## Installation

```sh
npm i -S to-element
```

## Usage

```js
const toElement = require('to-element')
const { Foo } = require('./ui')

const jsxStr = '<Foo>{bar}</Foo>'
const scope = {
  Foo,
  bar: 'baz'
}

toElement(jsxStr, scope)
```

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

***

[Made by Compositor](https://compositor.io/)
|
[MIT License](../license)
