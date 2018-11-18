# remark-images

[![Build Status][build-badge]][build]
[![lerna][lerna-badge]][lerna]
[![Join the community on Spectrum][spectrum-badge]][spectrum]

Turn image urls into images with **[remark][]**.

## Installation

[npm][]:

```shell
npm i -S remark-images
```

## Usage

Say we have the following file, `example.md`:

```markdown
#### A url

Below will render an image:

https://c8r-x0.s3.amazonaws.com/lab-components-macbook.jpg
```

And our script, `example.js`, looks as follows:

```javascript
const vfile = require('to-vfile')
const remark = require('remark')
const images = require('remark-images')

remark()
  .use(images)
  .process(vfile.readSync('example.md'), function(err, file) {
    if (err) throw err
    console.log(String(file))
  })
```

Now, running `node example` yields:

```markdown
#### A url

Below will render an image:

[![](https://c8r-x0.s3.amazonaws.com/lab-components-macbook.jpg)](https://c8r-x0.s3.amazonaws.com/lab-components-macbook.jpg)
```

## API

### `remark().use(images)`

Transform URLs in text that reference images (`png`, `svg`, `jpg`, `jpeg`, or
`gif`) to images.

Supported urls / uris:

*   `https://example.com/image.jpg`
*   `/image.jpg`
*   `./image.jpg`
*   `../image.jpg`

## Contribute

See [`contributing.md` in `mdx-js/mdx`][contributing] for ways to get started.

This organisation has a [Code of Conduct][coc].
By interacting with this repository, organisation, or community you agree to
abide by its terms.

## License

[MIT][] © [Compositor][] and [ZEIT][]

<!-- Definitions -->

[build]: https://travis-ci.org/mdx-js/mdx

[build-badge]: https://travis-ci.org/mdx-js/mdx.svg?branch=master

[lerna]: https://lernajs.io/

[lerna-badge]: https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg

[spectrum]: https://spectrum.chat/mdx

[spectrum-badge]: https://withspectrum.github.io/badge/badge.svg

[contributing]: https://github.com/mdx-js/mdx/blob/master/contributing.md

[coc]: https://github.com/mdx-js/mdx/blob/master/code-of-conduct.md

[mit]: license

[remark]: https://github.com/remarkjs/remark

[compositor]: https://compositor.io

[zeit]: https://zeit.co

[npm]: https://docs.npmjs.com/cli/install
