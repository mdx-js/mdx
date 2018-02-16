const unified = require('unified')
const remark = require('remark-parse')
const inspect = require('unist-util-inspect')

const getImports = require('./get-imports')
const toMDXAST = require('./')()

const MDX = `
import { Foo } from 'bar'

# Hello, world!

<Foo />
`

const options = {
  blocks: getImports(MDX).blocks
}

const tree = unified()
  .use(remark, options)
  .use(toMDXAST, options)
  .parse(MDX)

const mdxast = toMDXAST(tree)

console.log(inspect(mdxast))
