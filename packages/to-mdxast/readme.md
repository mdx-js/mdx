# to-mdxast

Transforms MDAST to MDXAST.

## Installation

```sh
npm i -S mdast-util-to-mdxast
```

## Usage

```js
const unified = require('unified')
const remark = require('remark-parse')
const inspect = require('unist-util-inspect')
const toMAST = require('to-mdast')
const { getImports } = require('to-mdast')

const MDX = `
import { Foo } from 'bar'

# Hello, world!

<Foo />
`

// Import scope must be passed to the remark
// parser for block parsing
const options = {
  blocks: getImports(MDX).blocks
}

const tree = unified()
  .use(remark, options)
  .use(toMDXAST, options)
  .parse(MDX)

const mdxast = toMDXAST(options)(tree)

console.log(inspect(mdxast))
```

#### Output

```
root[3] (1:1-7:1, 0-53)
├─ import: "import { Foo } from 'bar'" (2:1-2:26, 1-26)
├─ heading[1] (4:1-4:16, 28-43) [depth=1]
│  └─ text: "Hello, world!" (4:3-4:16, 30-43)
└─ jsx: "<Foo />" (6:1-6:8, 45-52)
```
