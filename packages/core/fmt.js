#! /usr/bin/env node

const fs = require('fs')
const prettier = require('prettier')
const stringify = require('remark-stringify')

const mdxParse = require('./')

const file = process.argv[2]
const mdx = fs.readFileSync(file, 'utf8')

const prettierOptions = {
  semi: false,
  singleQuote: true
}

function mdxCompilers () {
  this.Compiler.prototype.visitors.yaml = node =>
    '---\n' + node.value + '\n---'

  this.Compiler.prototype.visitors.import = node =>
    prettier.format(node.value, prettierOptions)
      .replace(/\n$/, '')

  this.Compiler.prototype.visitors.jsx = node =>
    prettier.format(node.value, prettierOptions)
      .replace(/^;/, '') // Prettier is prefixing with a ;
}

const formatted = mdxParse(mdx, {
  renderer: stringify,
  compilers: [
    mdxCompilers
  ]
})

console.log(formatted)
