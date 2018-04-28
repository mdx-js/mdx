# remark-images

Remark plugin to turn image urls into rendered images.

## Installation

```
npm i -s remark-images
```

## Usage

```
const remark = require('remark')
const images = require('remark-images')
const html = require('remark-html')

remark()
  .use(images)
  .use(html)
  .process(markdownString, function (err, file) {
    if (err) { throw err }

    console.log(String(file))
  })
```

### Example

```md
#### A url

Below will render an image:

https://c8r-x0.s3.amazonaws.com/lab-components-macbook.jpg
```

Supported urls / uris:

- `http://example.com/image.jpg`
- `/image.jpg`
- `./image.jpg`
- `../image.jpg`

Supported file types:

- `png`
- `svg`
- `jpg`
- `jpeg`
- `gif`
